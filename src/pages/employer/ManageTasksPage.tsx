import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Task, Job, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ManageTasksPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  useEffect(() => {
    if (selectedJob) fetchTasks(selectedJob);
  }, [selectedJob]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("employer_id", user.id);
    if (error) toast.error("Failed to fetch jobs");
    else setJobs(data || []);
    setLoading(false);
  };

  const fetchTasks = async (jobId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("job_id", jobId);
    if (error) toast.error("Failed to fetch tasks");
    else setTasks(data || []);
    setLoading(false);
  };

  const assignTask = async () => {
    if (!selectedJob || !studentId || !newTaskDesc) return;
    setLoading(true);
    const { error } = await supabase.from("tasks").insert({
      job_id: selectedJob,
      employer_id: user.id,
      student_id: studentId,
      description: newTaskDesc,
      status: "pending",
    });
    if (error) toast.error("Failed to assign task");
    else {
      toast.success("Task assigned");
      setNewTaskDesc("");
      fetchTasks(selectedJob);
    }
    setLoading(false);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);
    if (error) toast.error("Failed to update task");
    else {
      toast.success("Task updated");
      fetchTasks(selectedJob);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout userRole={UserRole.EMPLOYER}>
      <h2 className="text-2xl font-bold mb-4">Manage Tasks</h2>
      <div className="mb-4">
        <label>Select Job: </label>
        <select
          value={selectedJob}
          onChange={e => setSelectedJob(e.target.value)}
        >
          <option value="">-- Select --</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
      </div>
      {selectedJob && (
        <>
          <div className="mb-4">
            <Input
              placeholder="Student ID"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
            />
            <Input
              placeholder="Task Description"
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
            />
            <Button onClick={assignTask} disabled={loading}>
              Assign Task
            </Button>
          </div>
          <h3 className="font-semibold mb-2">Tasks</h3>
          <ul>
            {tasks.map(task => (
              <li key={task.id} className="mb-2 border p-2 rounded">
                <div><b>Student:</b> {task.student_id}</div>
                <div><b>Description:</b> {task.description}</div>
                <div><b>Status:</b> {task.status}</div>
                {task.file_url && (
                  <div><a href={task.file_url} target="_blank" rel="noopener noreferrer">View Submission</a></div>
                )}
                <Button onClick={() => updateTaskStatus(task.id, "approved")} disabled={loading || task.status === "approved"}>Approve</Button>
                <Button onClick={() => updateTaskStatus(task.id, "rejected")} disabled={loading || task.status === "rejected"}>Reject</Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashboardLayout>
  );
};

export default ManageTasksPage; 