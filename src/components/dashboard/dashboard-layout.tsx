import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Home, 
  Settings, 
  User,
  Users,
  Search,
  BookOpen,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roleAccess: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/student-dashboard",
    roleAccess: [UserRole.STUDENT],
  },
  {
    label: "Browse Jobs",
    icon: Search,
    href: "/student-dashboard/browse-jobs",
    roleAccess: [UserRole.STUDENT],
  },
  {
    label: "My Applications",
    icon: BookOpen,
    href: "/student-dashboard/applications",
    roleAccess: [UserRole.STUDENT],
  },
  {
    label: "Profile",
    icon: User,
    href: "/student-dashboard/profile",
    roleAccess: [UserRole.STUDENT],
  },
  {
    label: "Dashboard",
    icon: Home,
    href: "/employer-dashboard",
    roleAccess: [UserRole.EMPLOYER],
  },
  {
    label: "Post Job",
    icon: Briefcase,
    href: "/employer-dashboard/post-job",
    roleAccess: [UserRole.EMPLOYER],
  },
  {
    label: "Manage Jobs",
    icon: Briefcase,
    href: "/employer-dashboard/manage-jobs",
    roleAccess: [UserRole.EMPLOYER],
  },
  {
    label: "Applications",
    icon: Users,
    href: "/employer-dashboard/applications",
    roleAccess: [UserRole.EMPLOYER],
  },
  {
    label: "Company Profile",
    icon: User,
    href: "/employer-dashboard/profile",
    roleAccess: [UserRole.EMPLOYER],
  },
  {
    label: "Dashboard",
    icon: Home,
    href: "/admin-dashboard",
    roleAccess: [UserRole.ADMIN],
  },
  {
    label: "Manage Users",
    icon: Users,
    href: "/admin-dashboard/manage-users",
    roleAccess: [UserRole.ADMIN],
  },
  {
    label: "Manage Jobs",
    icon: Briefcase,
    href: "/admin-dashboard/manage-jobs",
    roleAccess: [UserRole.ADMIN],
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin-dashboard/settings",
    roleAccess: [UserRole.ADMIN],
  },
];

export const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const filteredNavItems = navItems.filter(item => 
    item.roleAccess.includes(userRole)
  );

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-job-600 to-brand-500 bg-clip-text text-transparent">
              Pay4Skill
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-4 pb-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-job-100 text-job-700 dark:bg-job-900 dark:text-job-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full justify-start text-gray-700 dark:text-gray-300"
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-2 py-2">
        <div className="flex justify-around">
          {filteredNavItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center p-2 rounded-md",
                  isActive
                    ? "text-job-600 dark:text-job-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {filteredNavItems.find(item => item.href === location.pathname)?.label || "Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              <Button size="icon" variant="ghost" onClick={() => toast.info("No new notifications")}>
                <Bell className="h-5 w-5" />
              </Button>
              <div
                className="w-8 h-8 bg-job-100 dark:bg-job-800 rounded-full flex items-center justify-center text-job-600 dark:text-job-300 cursor-pointer border-2 border-transparent hover:border-job-600 transition"
                onClick={() => {
                  if (userRole === UserRole.STUDENT) {
                    navigate("/student-dashboard/profile");
                  } else if (userRole === UserRole.EMPLOYER) {
                    navigate("/employer-dashboard/profile");
                  } else if (userRole === UserRole.ADMIN) {
                    navigate("/admin-dashboard/settings");
                  }
                }}
                title="View Profile"
              >
                {userRole === UserRole.STUDENT ? "S" : userRole === UserRole.EMPLOYER ? "E" : "A"}
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 pb-16 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
