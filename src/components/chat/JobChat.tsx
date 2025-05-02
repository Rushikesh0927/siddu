import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface JobChatProps {
  jobId: string;
  studentId: string;
  user: { id: string; name: string; role: string };
}

const JobChat = ({ jobId, studentId, user }: JobChatProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch job status to hide chat if finished
  useEffect(() => {
    if (!jobId) return;
    supabase
      .from("jobs")
      .select("status")
      .eq("id", jobId)
      .single()
      .then(({ data }) => setJobStatus(data?.status || null));
  }, [jobId]);

  // Fetch chat history
  useEffect(() => {
    if (!jobId) return;
    supabase
      .from("messages")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError("Failed to load messages");
        setMessages(data || []);
      });
  }, [jobId]);

  // Subscribe to new messages in real time
  useEffect(() => {
    if (!jobId) return;
    const channel = supabase
      .channel(`messages-job-${jobId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a text message
  const sendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    const { error } = await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: user.id,
      receiver_id: user.role === "student" ? undefined : studentId,
      content: input,
    });
    if (error) setError("Failed to send message");
    setInput("");
  };

  // Handle image upload and send as message
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const filePath = `chat/${jobId}/${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('task-files').upload(filePath, file);
    if (!uploadError) {
      const { data } = supabase.storage.from('task-files').getPublicUrl(filePath);
      if (data?.publicUrl) {
        const { error: insertError } = await supabase.from("messages").insert({
          job_id: jobId,
          sender_id: user.id,
          receiver_id: user.role === "student" ? undefined : studentId,
          image_url: data.publicUrl
        });
        if (insertError) setError("Failed to send image message");
      } else {
        setError("Failed to get image URL");
      }
    } else {
      setError("Failed to upload image");
    }
    setUploading(false);
  };

  if (jobStatus === "COMPLETED") {
    return (
      <div className="border rounded p-4 max-w-md mx-auto bg-white dark:bg-gray-900 text-center text-gray-500">
        Chat is no longer available. This job is completed.
      </div>
    );
  }

  return (
    <div className="border rounded p-4 max-w-md mx-auto bg-white dark:bg-gray-900">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="h-64 overflow-y-auto mb-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className="mb-1">
            <span className="font-semibold">{msg.sender_id === user.id ? "You" : "Other"}:</span>
            {msg.image_url ? (
              <img src={msg.image_url} alt="chat-img" className="max-w-xs max-h-48 rounded my-2" />
            ) : (
              <span>{msg.content}</span>
            )}
            <span className="text-xs text-gray-400 ml-2">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ""}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default JobChat; 