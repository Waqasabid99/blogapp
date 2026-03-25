import DashboardClient from "@/components/dashboard/Dashboard";
import { getDashboardAnalytics } from "@/actions/analytics.action";

export const metadata = {
  title: "Dashboard — Newszone",
  description: "Your analytics dashboard",
};

const DashboardPage = async ({ searchParams }) => {
  const range = 30;
  const data = await getDashboardAnalytics(range);

  return <DashboardClient analytics={data?.data} range={range} />;
};

export default DashboardPage;