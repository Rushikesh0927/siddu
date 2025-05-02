import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import BrowseJobsPage from "./pages/student/BrowseJobsPage";
import ApplicationsPage from "./pages/student/ApplicationsPage";
import ProfilePage from "./pages/student/ProfilePage";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import PostJobPage from "./pages/employer/PostJobPage";
import ManageJobsPage from "./pages/employer/ManageJobsPage";
import ManageApplicationsPage from "./pages/employer/ManageApplicationsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManageUsersPage from "./pages/admin/ManageUsersPage";
import AdminManageJobsPage from "./pages/admin/ManageJobsPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/protected-route";
import { UserRole } from "./types";
import { TooltipProvider } from "@/components/ui/tooltip";
import ManageTasksPage from "./pages/employer/ManageTasksPage";
import MyTasksPage from "./pages/student/MyTasksPage";
import JobDetailsPage from "./pages/employer/JobDetailsPage";
import StudentJobDetailsPage from "./pages/student/JobDetailsPage";
import StudentJobHistoryPage from "./pages/student/JobHistoryPage";
import StudentRatingsPage from "./pages/student/RatingsPage";
import EmployerJobHistoryPage from "./pages/employer/JobHistoryPage";
import EmployerRatingsPage from "./pages/employer/RatingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            
            {/* Student Routes */}
            <Route path="/student-dashboard" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard/browse-jobs" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <BrowseJobsPage />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard/applications" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <ApplicationsPage />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard/profile" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard/my-tasks" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <MyTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard/job/:jobId" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentJobDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard/job-history" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentJobHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard/ratings" element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentRatingsPage />
              </ProtectedRoute>
            } />
            
            {/* Employer Routes */}
            <Route path="/employer-dashboard" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <EmployerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/post-job" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <PostJobPage />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/manage-jobs" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <ManageJobsPage />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/applications" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <ManageApplicationsPage />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/profile" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/manage-tasks" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <ManageTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/job/:jobId" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <JobDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/job-history" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <EmployerJobHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard/ratings" element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
                <EmployerRatingsPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard/manage-users" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminManageUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard/manage-jobs" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminManageJobsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard/settings" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminSettingsPage />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
