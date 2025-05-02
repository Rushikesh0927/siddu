import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";

interface RatingFormProps {
  jobId: string;
  ratedUserId: string;
  onSuccess?: () => void;
}

const RatingForm = ({ jobId, ratedUserId, onSuccess }: RatingFormProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a rating");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("ratings").insert({
        job_id: jobId,
        rater_id: user.id,
        rated_id: ratedUserId,
        rating,
        feedback: feedback.trim() || null,
      });

      if (error) throw error;

      toast.success("Rating submitted successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Your Rating</h4>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className={`text-2xl ${
                value <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Feedback (Optional)</h4>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience working together..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="w-full"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </div>
  );
};

export default RatingForm; 