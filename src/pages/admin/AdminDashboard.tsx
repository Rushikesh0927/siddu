
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Users, Briefcase, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    employers: 0,
    jobs: 0,
    applications: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get user statistics
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("role");
        
        if (usersError) throw usersError;
        
        const students = usersData?.filter(user => user.role === "STUDENT").length || 0;
        const employers = usersData?.filter(user => user.role === "EMPLOYER").length || 0;
        const totalUsers = usersData?.length || 0;
        
        // Get job count
        const { count: jobCount, error: jobsError } = await supabase
          .from("jobs")
          .select("*", { count: 'exact', head: true });
        
        if (jobsError) throw jobsError;
        
        // Get application count
        const { count: appCount, error: appError } = await supabase
          .from("applications")
          .select("*", { count: 'exact', head: true });
        
        if (appError) throw appError;
        
        setStats({
          totalUsers,
          students,
          employers,
          jobs: jobCount || 0,
          applications: appCount || 0
        });
        
        // Get recent users
        const { data: recentUsersData, error: recentUsersError } = await supabase
          .from("profiles")
          .select("id, name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (recentUsersError) throw recentUsersError;
        
        setRecentUsers(recentUsersData || []);
        
        // Get recent jobs
        const { data: recentJobsData, error: recentJobsError } = await supabase
          .from("jobs")
          .select(`
            id, 
            title, 
            company, 
            status, 
            created_at,
            employer:employer_id(name)
          `)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (recentJobsError) throw recentJobsError;
        
        setRecentJobs(recentJobsData || []);
        
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout userRole={UserRole.ADMIN}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader className="h-8 w-8 animate-spin text-job-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={UserRole.ADMIN}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-500" />
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.students}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Employers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-purple-500" />
                  <p className="text-2xl font-bold">{stats.employers}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-amber-500" />
                  <p className="text-2xl font-bold">{stats.jobs}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-red-500" />
                  <p className="text-2xl font-bold">{stats.applications}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest users registered on the platform</CardDescription>
              </div>
              <Link to="/admin-dashboard/manage-users">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Role</th>
                      <th className="text-left py-3 px-4 font-medium">Date Joined</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">{user.name || 'Unnamed User'}</td>
                        <td className="py-3 px-4">{user.role}</td>
                        <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Latest job postings on the platform</CardDescription>
              </div>
              <Link to="/admin-dashboard/manage-jobs">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Title</th>
                      <th className="text-left py-3 px-4 font-medium">Company</th>
                      <th className="text-left py-3 px-4 font-medium">Posted By</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Posted Date</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map(job => (
                      <tr key={job.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">{job.title}</td>
                        <td className="py-3 px-4">{job.company}</td>
                        <td className="py-3 px-4">{job.employer?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            job.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : job.status === 'INACTIVE'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatDate(job.created_at)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No jobs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
