import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader, Search, UserX, UserCheck, MoreHorizontal } from "lucide-react";
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

interface UserDetails {
  id: string;
  name: string;
  email?: string;
  role: UserRole; // Ensure this is UserRole enum, not string
  created_at: string;
  status: string;
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [userApplications, setUserApplications] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users from profiles table
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, created_at");
      if (error) throw error;
      // Map to UserDetails
      const usersData = (profiles || []).map((profile: any) => ({
        id: profile.id,
        name: profile.name || "Unnamed User",
        email: profile.email || "",
        role: profile.role || UserRole.STUDENT,
        created_at: profile.created_at || new Date().toISOString(),
        status: "Active"
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: 'none' }
      );
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: "Banned" } : user
      ));
      
      toast.success("User banned successfully");
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: '0 seconds' }
      );
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: "Active" } : user
      ));
      
      toast.success("User unbanned successfully");
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT:
        return <Badge className="bg-green-500">Student</Badge>;
      case UserRole.EMPLOYER:
        return <Badge className="bg-blue-500">Employer</Badge>;
      case UserRole.ADMIN:
        return <Badge className="bg-purple-500">Admin</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleViewDetails = async (user: UserDetails) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
    // Fetch jobs posted (if employer)
    if (user.role === UserRole.EMPLOYER) {
      const { data } = await supabase
        .from("jobs")
        .select("id, title, status, created_at")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });
      setUserJobs(data || []);
      setUserApplications([]);
    } else if (user.role === UserRole.STUDENT) {
      // Fetch jobs applied to (if student)
      const { data } = await supabase
        .from("applications")
        .select("job_id, status, created_at, job:job_id(title)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setUserApplications(data || []);
      setUserJobs([]);
    } else {
      setUserJobs([]);
      setUserApplications([]);
    }
  };

  return (
    <DashboardLayout userRole={UserRole.ADMIN}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value={UserRole.STUDENT}>Students</SelectItem>
                <SelectItem value={UserRole.EMPLOYER}>Employers</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-job-600" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-4 px-6 font-medium">Name</th>
                        <th className="text-left py-4 px-6 font-medium">Email</th>
                        <th className="text-left py-4 px-6 font-medium">Role</th>
                        <th className="text-left py-4 px-6 font-medium">Status</th>
                        <th className="text-left py-4 px-6 font-medium">Joined On</th>
                        <th className="text-right py-4 px-6 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-4 px-6">{user.name}</td>
                          <td className="py-4 px-6">{user.email}</td>
                          <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                          <td className="py-4 px-6">
                            <Badge variant={user.status === "Active" ? "outline" : "destructive"}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">{formatDate(user.created_at)}</td>
                          <td className="py-4 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(user)}
                                >
                                  View Details
                                </DropdownMenuItem>
                                {user.status === "Active" ? (
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={() => banUser(user.id)}
                                  >
                                    Ban User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => unbanUser(user.id)}
                                  >
                                    Unban User
                                  </DropdownMenuItem>
                                )}
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
                <p className="text-gray-500">No users found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* User details dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">User ID</h4>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{selectedUser.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Name</h4>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Email</h4>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Role</h4>
                  <p className="text-sm">{getRoleBadge(selectedUser.role)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <p className="text-sm">
                    <Badge variant={selectedUser.status === "Active" ? "outline" : "destructive"}>
                      {selectedUser.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Joined On</h4>
                  <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                </div>
                {selectedUser.role === UserRole.EMPLOYER && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Jobs Posted</h4>
                    {userJobs.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm">
                        {userJobs.map(job => (
                          <li key={job.id}>{job.title} <span className="text-xs text-gray-500">({job.status})</span></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">No jobs posted.</p>
                    )}
                  </div>
                )}
                {selectedUser.role === UserRole.STUDENT && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Jobs Applied To</h4>
                    {userApplications.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm">
                        {userApplications.map(app => (
                          <li key={app.job_id}>{app.job?.title || app.job_id} <span className="text-xs text-gray-500">({app.status})</span></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">No applications found.</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                {selectedUser.status === "Active" ? (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      banUser(selectedUser.id);
                      setShowDetailsDialog(false);
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      unbanUser(selectedUser.id);
                      setShowDetailsDialog(false);
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Unban User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageUsersPage;
