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
  const [isApproved, setIsApproved] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [rating, setRating] = useState<{ rating: number; feedback: string | null } | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  useEffect(() => {
    if (!jobId || !user) return;

    // Check if student is approved for this job
    supabase
      .from("applications")
      .select("status")
      .eq("job_id", jobId)
      .eq("student_id", user.id)
      .then(({ data }) => setIsApproved(data?.[0]?.status === "APPROVED"));

    // Fetch job details
    supabase
      .from("jobs")
      .select(`
        *,
        employer:employer_id(
          id,
          name,
          email
        )
      `)
      .eq("id", jobId)
      .single()
      .then(({ data }) => setJob(data));

    // Fetch rating if exists
    supabase
      .from("ratings")
      .select("rating, feedback")
      .eq("job_id", jobId)
      .eq("rated_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setRating({
            rating: data.rating,
            feedback: data.feedback,
          });
        }
      });
  }, [jobId, user]);

  const handleRatingSuccess = () => {
    setShowRatingDialog(false);
    // Refresh rating
    supabase
      .from("ratings")
      .select("rating, feedback")
      .eq("job_id", jobId)
      .eq("rated_id", user?.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setRating({
            rating: data.rating,
            feedback: data.feedback,
          });
        }
      });
  };

  if (!job) {
    return (
      <DashboardLayout userRole={UserRole.STUDENT}>
        <div className="flex justify-center py-8">
          <p>Loading job details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
          <p className="text-gray-500">
            {job.company} • {job.location} • {job.type}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{job.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Employer</h3>
            <p className="text-gray-600">
              {job.employer?.name || "Unknown"} ({job.employer?.email})
            </p>
          </div>

          {isApproved && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Chat with Employer</h3>
              <JobChat
                jobId={jobId!}
                studentId={user?.id!}
                user={{ id: user?.id!, name: user?.email || "Student", role: "student" }}
              />
            </div>
          )}

          {job.status === "COMPLETED" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Rating</h3>
              {rating ? (
                <div>
                  <h4 className="text-sm font-medium mb-1">Your Rating</h4>
                  <RatingDisplay
                    rating={rating.rating}
                    feedback={rating.feedback}
                  />
                </div>
              ) : (
                <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Rate Employer</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate Employer</DialogTitle>
                    </DialogHeader>
                    <RatingForm
                      jobId={jobId!}
                      ratedUserId={job.employer_id}
                      onSuccess={handleRatingSuccess}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetailsPage; 