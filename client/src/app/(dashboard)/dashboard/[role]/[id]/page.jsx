import DashboardClient from "@/components/dashboard/Dashboard";

export const metadata = {
  title: "Dashboard — Newszone",
  description: "Your analytics dashboard",
};

const DashboardPage = async ({ searchParams }) => {
  const range = await searchParams.range || 30;
  return <DashboardClient range={range} />;
};

export default DashboardPage;