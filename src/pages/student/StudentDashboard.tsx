import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
}

const JobCard = ({ id, title, company, location, type, skills }: JobCardProps) => {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if already applied
    const checkIfApplied = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("job_id", id)
          .eq("student_id", user.id);
          
        if (error) {
          console.error("Error checking application:", error);
          return;
        }
        
        setHasApplied(data && data.length > 0);
      }
    };
    
    checkIfApplied();
  }, [id, user]);

  const applyForJob = async () => {
    if (!user) {
      toast.error("You need to be logged in to apply");
      return;
    }
    
    setIsApplying(true);
    
    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: id,
          student_id: user.id,
          status: "PENDING"
        });
        
      if (error) throw error;
      
      setHasApplied(true);
      toast.success("Application submitted successfully");
    } catch (error: any) {
      console.error("Error applying:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription>{company} • {location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p className="font-medium">Job Type: <span className="font-normal">{type}</span></p>
          <div className="mt-2">
            <p className="font-medium mb-1">Skills:</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {hasApplied ? (
          <Button variant="outline" className="w-full" disabled>
            Applied
          </Button>
        ) : (
          <Button 
            onClick={applyForJob} 
            className="w-full" 
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : "Apply Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const StudentDashboard = () => {
  const [recentJobs, setRecentJobs] = useState<JobCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false })
          .limit(4);
          
        if (error) throw error;
        
        setRecentJobs(data || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load recent jobs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  return (
    <DashboardLayout userRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Welcome to your dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="bg-job-100 dark:bg-job-800">
              <CardTitle className="text-job-700 dark:text-job-300">Browse Jobs</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Explore available job opportunities that match your skills and preferences.</p>
            </CardContent>
            <CardFooter>
              <Link to="/student-dashboard/browse-jobs" className="w-full">
                <Button variant="outline" className="w-full">Browse Jobs</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="bg-emerald-100 dark:bg-emerald-800">
              <CardTitle className="text-emerald-700 dark:text-emerald-300">My Applications</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Track the status of your job applications and receive updates.</p>
            </CardContent>
            <CardFooter>
              <Link to="/student-dashboard/applications" className="w-full">
                <Button variant="outline" className="w-full">View Applications</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="bg-purple-100 dark:bg-purple-800">
              <CardTitle className="text-purple-700 dark:text-purple-300">Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Update your personal information and manage your account settings.</p>
            </CardContent>
            <CardFooter>
              <Link to="/student-dashboard/profile" className="w-full">
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="bg-blue-100 dark:bg-blue-800">
              <CardTitle className="text-blue-700 dark:text-blue-300">My Tasks</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>View and manage your assigned tasks for jobs you have been approved for.</p>
            </CardContent>
            <CardFooter>
              <Link to="/student-dashboard/my-tasks" className="w-full">
                <Button variant="outline" className="w-full">My Tasks</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="bg-yellow-100 dark:bg-yellow-800">
              <CardTitle className="text-yellow-700 dark:text-yellow-300">Job History</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>See a list of jobs you have completed.</p>
            </CardContent>
            <CardFooter>
              <Link to="/student-dashboard/job-history" className="w-full">
                <Button variant="outline" className="w-full">Job History</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="bg-pink-100 dark:bg-pink-800">
              <CardTitle className="text-pink-700 dark:text-pink-300">Ratings & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>View and give feedback for jobs and employers.</p>
            </CardContent>
            <CardFooter>
              <Link to="/student-dashboard/ratings" className="w-full">
                <Button variant="outline" className="w-full">Ratings & Feedback</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Recent Job Postings</h3>
            <Link to="/student-dashboard/browse-jobs">
              <Button variant="link">View All</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-job-600" />
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  type={job.type}
                  skills={job.skills}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No job postings available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
