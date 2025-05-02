import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { UserRole } from "@/types";

const RatingsPage = () => {
  return (
    <DashboardLayout userRole={UserRole.EMPLOYER}>
      <h2 className="text-2xl font-bold mb-4">Ratings & Feedback</h2>
      <p>Ratings and feedback for students and jobs will appear here.</p>
    </DashboardLayout>
  );
};

export default RatingsPage; 