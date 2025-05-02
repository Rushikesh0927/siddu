// Fix issues with student property access and type errors
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define proper types for application details
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "HOLD";

interface ApplicationDetails {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  job: {
    id: string;
    title: string;
  };
  student: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    college?: string;
    skills?: string[];
  } | null;
}

const ManageApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [assigningTask, setAssigningTask] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          created_at,
          job:job_id (
            id, 
            title,
            employer_id
          ),
          student:student_id (
            id,
            name,
            email,
            phone,
            college,
            skills
          )
        `)
        .eq("job.employer_id", user.id);
      
      if (error) throw error;
      
      // Convert any non-compliant status strings to our ApplicationStatus type
      // and ensure we handle potentially null student data
      const processedApplications = data.map((app: any) => ({
        id: app.id,
        status: app.status as ApplicationStatus,
        created_at: app.created_at,
        job: {
          id: app.job.id,
          title: app.job.title,
        },
        student: app.student ? {
          id: app.student.id || '',
          name: app.student.name || '',
          email: app.student.email,
          phone: app.student.phone,
          college: app.student.college,
          skills: app.student.skills,
        } : null
      }));
      
      setApplications(processedApplications);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error(error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };
  
  const updateApplicationStatus = async (id: string, newStatus: ApplicationStatus) => {
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update the application in the local state
      setApplications(apps => 
        apps.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
      
      toast.success(`Application ${newStatus.toLowerCase()}`);
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast.error(error.message || "Failed to update application status");
    } finally {
      setUpdating(false);
    }
  };
  
  const viewApplicationDetails = (application: ApplicationDetails) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "REJECTED":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
      case "HOLD":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const assignTask = async () => {
    if (!selectedApplication || !selectedApplication.student) return;
    setAssigningTask(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        job_id: selectedApplication.job.id,
        employer_id: user.id,
        student_id: selectedApplication.student.id,
        description: taskDesc,
        status: "pending"
      });
      if (error) throw error;
      toast.success("Task assigned successfully");
      setShowTaskForm(false);
      setTaskDesc("");
    } catch (error) {
      toast.error("Failed to assign task");
    } finally {
      setAssigningTask(false);
    }
  };

  return (
    <DashboardLayout userRole={UserRole.EMPLOYER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Applications</h2>
          <Button onClick={fetchApplications}>
            Refresh
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Job Applications</CardTitle>
            <CardDescription>
              View and manage applications to your job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : applications.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          {application.student?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{application.job.title}</TableCell>
                        <TableCell>{formatDate(application.created_at)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => viewApplicationDetails(application)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No applications found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Application Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the candidate's information and update the application status.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Job Position</h3>
                  <p className="text-sm">{selectedApplication.job.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Application Date</h3>
                  <p className="text-sm">{formatDate(selectedApplication.created_at)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Applicant Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedApplication.student?.name || "Unknown"}</p>
                  <p><span className="font-medium">Email:</span> {selectedApplication.student?.email || "Not provided"}</p>
                  <p><span className="font-medium">Phone:</span> {selectedApplication.student?.phone || "Not provided"}</p>
                  <p><span className="font-medium">College:</span> {selectedApplication.student?.college || "Not provided"}</p>
                  
                  {selectedApplication.student?.skills && selectedApplication.student.skills.length > 0 && (
                    <div>
                      <span className="font-medium">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApplication.student.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-secondary rounded-md text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Update Status</h3>
                <Select
                  defaultValue={selectedApplication.status}
                  onValueChange={(value) => 
                    updateApplicationStatus(
                      selectedApplication.id, 
                      value as ApplicationStatus
                    )
                  }
                >
                  <SelectTrigger className="w-full" disabled={updating}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="HOLD">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {selectedApplication && selectedApplication.status === "APPROVED" && selectedApplication.student && (
            <div className="space-y-2 mt-4">
              <Button variant="outline" onClick={() => setShowTaskForm(v => !v)}>
                {showTaskForm ? "Cancel" : "Assign Task"}
              </Button>
              {showTaskForm && (
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="Task description"
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                  />
                  <Button onClick={assignTask} disabled={assigningTask || !taskDesc}>
                    {assigningTask ? 'Assigning...' : 'Assign'}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageApplicationsPage;
