import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

interface JobProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
  description: string;
}

const BrowseJobsPage = () => {
  const [jobs, setJobs] = useState<JobProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState<string>("ALL");
  const [hasApplied, setHasApplied] = useState<{[key: string]: boolean}>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    if (user) {
      checkApplicationStatus();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load job listings");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("student_id", user?.id);
        
      if (error) throw error;
      
      const appliedJobsMap: {[key: string]: boolean} = {};
      data?.forEach(app => {
        appliedJobsMap[app.job_id] = true;
      });
      
      setHasApplied(appliedJobsMap);
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const applyForJob = async (jobId: string) => {
    if (!user) {
      toast.error("You need to be logged in to apply");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          student_id: user.id,
          status: "PENDING"
        });
        
      if (error) throw error;
      
      setHasApplied(prev => ({...prev, [jobId]: true}));
      toast.success("Application submitted successfully");
    } catch (error: any) {
      console.error("Error applying:", error);
      toast.error(error.message || "Failed to submit application");
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = jobType === "ALL" || job.type === jobType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout userRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Browse Available Jobs</h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Search jobs by title, company, skills..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setJobType("ALL");
            }}>
              Reset
            </Button>
          </div>
          
          {/* Job Listings */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-job-600" />
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <Badge>{job.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm line-clamp-3">{job.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 dark:bg-gray-900 px-6 py-4 flex flex-col gap-2">
                    <Button variant="outline" onClick={() => navigate(`/student-dashboard/job/${job.id}`)}>
                      View Details
                    </Button>
                    {hasApplied[job.id] ? (
                      <Button variant="outline" className="w-full" disabled>
                        Applied
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => applyForJob(job.id)} 
                        className="w-full"
                      >
                        Apply Now
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No jobs found matching your criteria.</p>
                <Button variant="link" onClick={() => {
                  setSearchTerm("");
                  setJobType("ALL");
                }}>
                  Reset filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrowseJobsPage;
