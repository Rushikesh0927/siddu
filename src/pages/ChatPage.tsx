import { useParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import JobChat from "@/components/chat/JobChat";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";

const ChatPage = () => {
  const { jobId, userId } = useParams();
  const { user } = useAuth();

  // You can add logic here to fetch the other user's info if needed

  const safeUser = user ? { id: user.id, name: user.email || "User", role: (user.role as UserRole) || "student" } : { id: "", name: "", role: "student" };
  const safeRole = (user.role as UserRole) || UserRole.STUDENT;

  return (
    <DashboardLayout userRole={safeRole}>
      <div className="flex flex-col h-[80vh] w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b bg-gradient-to-r from-job-600 to-brand-500 text-white">
          <span className="font-semibold text-lg">Chat</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <JobChat jobId={jobId!} studentId={userId!} user={safeUser} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage; 