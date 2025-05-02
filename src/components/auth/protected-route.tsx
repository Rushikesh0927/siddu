
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-job-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    toast.error("Please log in to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not authorized for this role, redirect to appropriate dashboard
  if (userRole && !allowedRoles.includes(userRole)) {
    toast.error("You don't have permission to access this page");
    
    // Redirect to the appropriate dashboard based on role
    if (userRole === UserRole.STUDENT) {
      return <Navigate to="/student-dashboard" replace />;
    } else if (userRole === UserRole.EMPLOYER) {
      return <Navigate to="/employer-dashboard" replace />;
    } else if (userRole === UserRole.ADMIN) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    
    // Fallback to home page if role doesn't match any known role
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
