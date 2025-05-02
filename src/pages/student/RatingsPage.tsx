import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";

const RatingsPage = () => {
  return (
    <DashboardLayout userRole={UserRole.STUDENT}>
      <h2 className="text-2xl font-bold mb-4">Ratings & Feedback</h2>
      <p>Ratings and feedback for jobs and employers will appear here.</p>
    </DashboardLayout>
  );
};

export default RatingsPage; 