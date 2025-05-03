import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [employerId, setEmployerId] = useState<string | null>(null);

  // Fetch job status and employerId to hide chat if finished and get employerId
  useEffect(() => {
    if (!jobId) return;
    supabase
      .from("jobs")
      .select("status, employer_id")
      .eq("id", jobId)
      .single()
      .then(({ data }) => {
        setJobStatus(data?.status || null);
        setEmployerId(data?.employer_id || null);
      });
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
          // Only add if not already present (avoid duplicates)
          setMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
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
    // Determine receiver_id
    let receiver_id = null;
    if (user.role === "student") {
      receiver_id = employerId;
    } else {
      receiver_id = studentId;
    }
    if (!receiver_id) {
      setError("Receiver not found");
      return;
    }
    const { data, error } = await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: user.id,
      sender_name: user.name,
      receiver_id,
      content: input,
    }).select().single();
    if (error) {
      setError("Failed to send message");
      console.error("Supabase message insert error:", error);
    } else if (data) {
      setMessages((prev) => [...prev, data]);
    }
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
        // Determine receiver_id
        let receiver_id = null;
        if (user.role === "student") {
          receiver_id = employerId;
        } else {
          receiver_id = studentId;
        }
        if (!receiver_id) {
          setError("Receiver not found");
          setUploading(false);
          return;
        }
        const { data: inserted, error: insertError } = await supabase.from("messages").insert({
          job_id: jobId,
          sender_id: user.id,
          sender_name: user.name,
          receiver_id,
          image_url: data.publicUrl
        }).select().single();
        if (insertError) {
          setError("Failed to send image message");
          console.error("Supabase image message insert error:", insertError);
        } else if (inserted) {
          setMessages((prev) => [...prev, inserted]);
        }
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
    <div className="flex flex-col h-full w-full">
      {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50 dark:bg-gray-800">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id || idx} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{msg.sender_name ? msg.sender_name[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-xs rounded-2xl px-4 py-2 shadow-md ${isMe ? 'bg-gradient-to-br from-job-600 to-brand-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                {msg.image_url ? (
                  <img src={msg.image_url} alt="chat-img" className="max-w-xs max-h-48 rounded mb-1" />
                ) : (
                  <span>{msg.content}</span>
                )}
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ""}
                </div>
              </div>
              {isMe && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.name ? user.name[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-2 sticky bottom-0">
        <input
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-job-600"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" id="chat-image-upload" />
        <label htmlFor="chat-image-upload" className="cursor-pointer px-2 py-1 text-job-600 hover:text-brand-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5m-18 0A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 16.5m-18 0v-1.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 15v1.5m-9-6.75h.008v.008H12v-.008zm0 0a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
          </svg>
        </label>
        <button className="bg-job-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full transition" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default JobChat; 