import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import JobChat from "@/components/chat/JobChat";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RatingForm from "@/components/rating/RatingForm";
import RatingDisplay from "@/components/rating/RatingDisplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [approvedStudents, setApprovedStudents] = useState<any[]>([]);
  const [chatStudentId, setChatStudentId] = useState<string | null>(null);
  const [showTaskFormFor, setShowTaskFormFor] = useState<string | null>(null);
  const [taskDesc, setTaskDesc] = useState("");
  const [assigningTask, setAssigningTask] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, { rating: number; feedback: string | null }>>({});
  const [showRatingDialogFor, setShowRatingDialogFor] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    supabase
      .from("applications")
      .select("student_id, status, student:student_id(name, email)")
      .eq("job_id", jobId)
      .eq("status", "APPROVED")
      .then(({ data }) => setApprovedStudents(data || []));
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    supabase
      .from("tasks")
      .select("id, status")
      .eq("job_id", jobId)
      .then(({ data }) => setTasks(data || []));
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    supabase
      .from("ratings")
      .select("rated_id, rating, feedback")
      .eq("job_id", jobId)
      .then(({ data }) => {
        const ratingsMap = data?.reduce((acc, rating) => {
          acc[rating.rated_id] = {
            rating: rating.rating,
            feedback: rating.feedback,
          };
          return acc;
        }, {} as Record<string, { rating: number; feedback: string | null }>);
        setRatings(ratingsMap || {});
      });
  }, [jobId]);

  const allTasksApproved = tasks.length > 0 && tasks.every(t => t.status === "approved");
  const [finishing, setFinishing] = useState(false);

  const assignTask = async (studentId: string) => {
    setAssigningTask(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        job_id: jobId,
        employer_id: user.id,
        student_id: studentId,
        description: taskDesc,
        status: "pending"
      });
      if (error) throw error;
      toast.success("Task assigned successfully");
      setShowTaskFormFor(null);
      setTaskDesc("");
    } catch (error) {
      toast.error("Failed to assign task");
    } finally {
      setAssigningTask(false);
    }
  };

  const markJobAsFinished = async () => {
    setFinishing(true);
    try {
      const { error } = await supabase.from("jobs").update({ status: "COMPLETED" }).eq("id", jobId);
      if (error) throw error;
      toast.success("Job marked as finished");
    } catch (error) {
      toast.error("Failed to mark job as finished");
    } finally {
      setFinishing(false);
    }
  };

  const handleRatingSuccess = () => {
    setShowRatingDialogFor(null);
    // Refresh ratings
    supabase
      .from("ratings")
      .select("rated_id, rating, feedback")
      .eq("job_id", jobId)
      .then(({ data }) => {
        const ratingsMap = data?.reduce((acc, rating) => {
          acc[rating.rated_id] = {
            rating: rating.rating,
            feedback: rating.feedback,
          };
          return acc;
        }, {} as Record<string, { rating: number; feedback: string | null }>);
        setRatings(ratingsMap || {});
      });
  };

  return (
    <DashboardLayout userRole={UserRole.EMPLOYER}>
      <h2 className="text-2xl font-bold mb-4">Job Details</h2>
      <p>Job ID: {jobId}</p>
      {/* Add job details UI here */}
      {approvedStudents.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Approved Students</h3>
          <ul className="space-y-4">
            {approvedStudents.map((app) => (
              <li key={app.student_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{app.student?.name || app.student?.email || app.student_id}</h4>
                    <p className="text-sm text-gray-500">{app.student?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setChatStudentId(app.student_id)}>Chat</Button>
                    <Button onClick={() => setShowTaskFormFor(app.student_id)}>Assign Task</Button>
                    {!ratings[app.student_id] && (
                      <Dialog open={showRatingDialogFor === app.student_id} onOpenChange={(open) => !open && setShowRatingDialogFor(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setShowRatingDialogFor(app.student_id)}>
                            Rate Student
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rate Student</DialogTitle>
                          </DialogHeader>
                          <RatingForm
                            jobId={jobId!}
                            ratedUserId={app.student_id}
                            onSuccess={handleRatingSuccess}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
                {showTaskFormFor === app.student_id && (
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Task description"
                      value={taskDesc}
                      onChange={e => setTaskDesc(e.target.value)}
                    />
                    <Button onClick={() => assignTask(app.student_id)} disabled={assigningTask || !taskDesc}>
                      {assigningTask ? 'Assigning...' : 'Assign'}
                    </Button>
                  </div>
                )}
                {ratings[app.student_id] && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium mb-1">Your Rating</h5>
                    <RatingDisplay
                      rating={ratings[app.student_id].rating}
                      feedback={ratings[app.student_id].feedback}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
          {chatStudentId && user && (
            <JobChat jobId={jobId} studentId={chatStudentId} user={{ id: user.id, name: user.email || "Employer", role: "employer" }} />
          )}
        </div>
      )}
      {allTasksApproved && (
        <Button className="mt-4" onClick={markJobAsFinished} disabled={finishing}>
          {finishing ? "Finishing..." : "Mark as Finished"}
        </Button>
      )}
    </DashboardLayout>
  );
};

export default JobDetailsPage; 