import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader, Search, MoreHorizontal, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  skills: string[];
  status: string;
  created_at: string;
  employer: {
    id: string;
    name: string;
    email?: string;
  };
  application_count: number;
}

const AdminManageJobsPage = () => {
  const [jobs, setJobs] = useState<JobDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
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
          skills,
          status,
          created_at,
          employer:employer_id (
            id,
            name:profiles(name),
            email:auth.users!id(email)
          ),
          applications:applications(count)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to make it easier to work with
      const transformedJobs = data.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        skills: job.skills || [],
        status: job.status,
        created_at: job.created_at,
        employer: {
          id: job.employer.id,
          name: job.employer.name?.[0]?.name || "Unknown",
          email: job.employer.email?.[0]?.email
        },
        application_count: job.applications?.[0]?.count || 0
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", jobId);
        
      if (error) throw error;
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status } : job
      ));
      
      toast.success(`Job status updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case "HOLD":
        return <Badge className="bg-yellow-500">On Hold</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || job.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout userRole={UserRole.ADMIN}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Manage Jobs</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search jobs by title, company, or employer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-job-600" />
            </div>
          ) : filteredJobs.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-4 px-6 font-medium">Title</th>
                        <th className="text-left py-4 px-6 font-medium">Company</th>
                        <th className="text-left py-4 px-6 font-medium">Employer</th>
                        <th className="text-left py-4 px-6 font-medium">Location</th>
                        <th className="text-left py-4 px-6 font-medium">Status</th>
                        <th className="text-left py-4 px-6 font-medium">Applications</th>
                        <th className="text-left py-4 px-6 font-medium">Posted Date</th>
                        <th className="text-right py-4 px-6 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-4 px-6">{job.title}</td>
                          <td className="py-4 px-6">{job.company}</td>
                          <td className="py-4 px-6">{job.employer.name}</td>
                          <td className="py-4 px-6">{job.location}</td>
                          <td className="py-4 px-6">
                            <Select 
                              defaultValue={job.status} 
                              onValueChange={(value) => updateJobStatus(job.id, value)}
                            >
                              <SelectTrigger className="w-[110px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="HOLD">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-4 px-6">{job.application_count}</td>
                          <td className="py-4 px-6">{formatDate(job.created_at)}</td>
                          <td className="py-4 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                                  <Eye className="h-4 w-4 mr-2" /> View Job Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No jobs found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Job details dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Detailed information about the job posting.
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedJob.title}</h2>
                  <p className="text-sm text-gray-500">{selectedJob.company} • {selectedJob.location}</p>
                </div>
                {getStatusBadge(selectedJob.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Job Type</h4>
                  <p className="text-sm">{selectedJob.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Posted On</h4>
                  <p className="text-sm">{formatDate(selectedJob.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Applications</h4>
                  <p className="text-sm">{selectedJob.application_count}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Posted By</h4>
                  <p className="text-sm">{selectedJob.employer.name} ({selectedJob.employer.email})</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <div className="text-sm bg-gray-50 dark:bg-gray-850 p-4 rounded-md max-h-60 overflow-y-auto">
                  <p className="whitespace-pre-line">{selectedJob.description}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminManageJobsPage;
