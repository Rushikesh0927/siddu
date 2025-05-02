import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface CompletedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  created_at: string;
  completed_at: string;
  employer: {
    id: string;
    name: string;
    email: string;
  };
  rating?: number;
  feedback?: string;
}

const JobHistoryPage = () => {
  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCompletedJobs();
    }
  }, [user]);

  const fetchCompletedJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          company,
          location,
          type,
          description,
          created_at,
          completed_at,
          employer:employer_id(
            id,
            name,
            email
          ),
          rating:ratings(
            rating,
            feedback
          )
        `)
        .eq("status", "COMPLETED")
        .in("id", (
          await supabase
            .from("applications")
            .select("job_id")
            .eq("student_id", user?.id)
            .eq("status", "APPROVED")
        ).data?.map(app => app.job_id) || [])
        .order("completed_at", { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to make it easier to work with
      const transformedJobs = data.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        created_at: job.created_at,
        completed_at: job.completed_at,
        employer: {
          id: job.employer.id,
          name: job.employer.name || "Unknown",
          email: job.employer.email
        },
        rating: job.rating?.[0]?.rating,
        feedback: job.rating?.[0]?.feedback
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Error fetching completed jobs:", error);
      toast.error("Failed to load job history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <DashboardLayout userRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Job History</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {job.company} • {job.location} • {job.type}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        Completed on {formatDate(job.completed_at)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Employer</h4>
                        <p className="text-sm text-gray-600">
                          {job.employer.name} ({job.employer.email})
                        </p>
                      </div>
                      {job.rating && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Employer's Rating</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xl ${
                                    i < job.rating ? "text-yellow-400" : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {job.feedback && (
                              <p className="text-sm text-gray-600">{job.feedback}</p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/student-dashboard/job/${job.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No completed jobs found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobHistoryPage; 