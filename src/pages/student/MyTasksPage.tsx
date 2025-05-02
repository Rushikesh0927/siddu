import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Task, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const MyTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("student_id", user.id);
    if (error) toast.error("Failed to fetch tasks");
    else setTasks(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (taskId: string, file: File) => {
    setFileUploading(taskId);
    const filePath = `tasks/${taskId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("task-files")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast.error("File upload failed");
      setFileUploading(null);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("task-files")
      .getPublicUrl(filePath);
    const fileUrl = publicUrlData?.publicUrl || null;
    // Update task with file_url and mark as submitted
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ file_url: fileUrl, status: "submitted" })
      .eq("id", taskId);
    if (updateError) toast.error("Failed to submit task");
    else {
      toast.success("Task submitted!");
      fetchTasks();
    }
    setFileUploading(null);
  };

  return (
    <DashboardLayout userRole={UserRole.STUDENT}>
      <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="mb-4 border p-2 rounded">
            <div><b>Job:</b> {task.job_id}</div>
            <div><b>Description:</b> {task.description}</div>
            <div><b>Status:</b> {task.status}</div>
            {task.file_url && (
              <div><a href={task.file_url} target="_blank" rel="noopener noreferrer">View Submission</a></div>
            )}
            {task.status === "pending" || task.status === "rejected" ? (
              <div>
                <Input
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(task.id, e.target.files[0]);
                    }
                  }}
                  disabled={!!fileUploading}
                />
                {fileUploading === task.id && <span>Uploading...</span>}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </DashboardLayout>
  );
};

export default MyTasksPage; 