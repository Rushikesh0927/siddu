const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Supabase client setup
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vjkkfundbxrgcfcivcdy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Each chat room is jobId-studentId
io.on('connection', (socket) => {
  socket.on('joinRoom', async ({ jobId, studentId }) => {
    const room = `${jobId}-${studentId}`;
    socket.join(room);
    // Fetch previous messages
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('job_id', jobId)
      .eq('student_id', studentId)
      .order('timestamp', { ascending: true });
    socket.emit('chatHistory', data || []);
  });

  socket.on('chatMessage', async ({ jobId, studentId, sender, message }) => {
    const room = `${jobId}-${studentId}`;
    // Store message in DB
    await supabase.from('chat_messages').insert({
      job_id: jobId,
      student_id: studentId,
      sender,
      message
    });
    io.to(room).emit('chatMessage', { sender, message, timestamp: new Date().toISOString() });
  });
});

const PORT = process.env.CHAT_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.io chat server running on port ${PORT}`);
}); 