import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader, Clock, Check, X, Calendar, Briefcase, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

// Define the possible application status values
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "HOLD";

interface ApplicationProps {
  id: string;
  status: ApplicationStatus; // Update to use strict type
  created_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  }
}

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<ApplicationProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id, 
          status, 
          created_at,
          job:job_id (
            id,
            title, 
            company,
            location,
            type
          )
        `)
        .eq("student_id", user?.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Cast to ensure correct typing
        const typedData = data.map(app => ({
          id: app.id,
          status: app.status as ApplicationStatus,
          created_at: app.created_at,
          job: {
            id: app.job.id,
            title: app.job.title,
            company: app.job.company,
            location: app.job.location,
            type: app.job.type
          }
        }));
        
        setApplications(typedData);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "APPROVED":
        return <Check className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "HOLD":
        return <Badge className="bg-gray-500">On Hold</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <DashboardLayout userRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">My Job Applications</h2>
          
          {/* Applications List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-job-600" />
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-grow p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{application.job.title}</h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{application.job.company}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Applied on {formatDate(application.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{application.job.type}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col justify-between md:justify-center items-center border-t md:border-t-0 md:border-l dark:border-gray-700 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center gap-2 mb-0 md:mb-4">
                          {getStatusIcon(application.status)}
                          <span className="font-medium">Status</span>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/student-dashboard/job/${application.job.id}`)}>
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
                <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
                <Button onClick={() => window.location.href = '/student-dashboard/browse-jobs'}>
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsPage;
