const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Each chat room is jobId-studentId
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ jobId, studentId }) => {
    const room = `${jobId}-${studentId}`;
    socket.join(room);
  });

  socket.on('chatMessage', ({ jobId, studentId, sender, message }) => {
    const room = `${jobId}-${studentId}`;
    io.to(room).emit('chatMessage', { sender, message, timestamp: new Date().toISOString() });
  });
});

const PORT = process.env.CHAT_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.io chat server running on port ${PORT}`);
}); 