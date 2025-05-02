import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Loader, Eye, Edit, Trash } from "lucide-react";

interface JobWithApplicationCount {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  created_at: string;
  application_count: number;
}

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState<JobWithApplicationCount[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationLoading, setApplicationLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      // Fetch jobs with application counts
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            company,
            location,
            type,
            status,
            created_at,
            applications:applications(count)
          `)
          .eq("employer_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        // Transform data to include application count
        const jobsWithCount = data.map((job: any) => ({
          ...job,
          application_count: job.applications?.[0]?.count || 0
        }));
        
        setJobs(jobsWithCount);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load job listings");
      } finally {
        setLoading(false);
      }
      
      // Fetch recent applications
      try {
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id,
            status,
            created_at,
            jobs:job_id(title, company),
            students:student_id(name)
          `)
          .in("status", ["PENDING", "APPROVED", "REJECTED"])
          .eq("jobs.employer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        setRecentApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setApplicationLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case "HOLD":
        return <Badge className="bg-yellow-500">On Hold</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-blue-500">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout userRole={UserRole.EMPLOYER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Employer Dashboard</h2>
          <Link to="/employer-dashboard/post-job">
            <Button>Post New Job</Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{jobs.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {jobs.filter(job => job.status === "ACTIVE").length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {jobs.reduce((total, job) => total + job.application_count, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Your Job Listings</CardTitle>
            <CardDescription>Manage your job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-job-600" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Title</th>
                      <th className="text-left py-3 px-4 font-medium">Location</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Applications</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">{job.title}</td>
                        <td className="py-3 px-4">{job.location}</td>
                        <td className="py-3 px-4">{job.type}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-3 px-4">{job.application_count}</td>
                        <td className="py-3 px-4">{formatDate(job.created_at)}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/employer-dashboard/job/${job.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                <Link to="/employer-dashboard/post-job">
                  <Button>Post Your First Job</Button>
                </Link>
              </div>
            )}
          </CardContent>
          {jobs.length > 0 && (
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/employer-dashboard/manage-jobs')}>
                View All Jobs
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Review recent candidate applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-job-600" />
              </div>
            ) : recentApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Job</th>
                      <th className="text-left py-3 px-4 font-medium">Candidate</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Applied On</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((application) => (
                      <tr key={application.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">{application.jobs?.title || "Unknown Job"}</td>
                        <td className="py-3 px-4">{application.students?.name || "Unknown Candidate"}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(application.status)}
                        </td>
                        <td className="py-3 px-4">{formatDate(application.created_at)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications have been received yet.</p>
              </div>
            )}
          </CardContent>
          {recentApplications.length > 0 && (
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/employer-dashboard/applications')}>
                View All Applications
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader className="bg-blue-100 dark:bg-blue-800">
            <CardTitle className="text-blue-700 dark:text-blue-300">Manage Tasks</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Assign and review tasks for your job postings.</p>
          </CardContent>
          <CardFooter>
            <Link to="/employer-dashboard/manage-tasks" className="w-full">
              <Button variant="outline" className="w-full">Manage Tasks</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="bg-yellow-100 dark:bg-yellow-800">
            <CardTitle className="text-yellow-700 dark:text-yellow-300">Job History</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>See a list of jobs you have posted and completed.</p>
          </CardContent>
          <CardFooter>
            <Link to="/employer-dashboard/job-history" className="w-full">
              <Button variant="outline" className="w-full">Job History</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="bg-pink-100 dark:bg-pink-800">
            <CardTitle className="text-pink-700 dark:text-pink-300">Ratings & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>View and give feedback for students and jobs.</p>
          </CardContent>
          <CardFooter>
            <Link to="/employer-dashboard/ratings" className="w-full">
              <Button variant="outline" className="w-full">Ratings & Feedback</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
