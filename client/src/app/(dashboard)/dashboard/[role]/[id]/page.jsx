import AnalyticsDashboard from "@/components/dashboard/Dashboard"
import { generateSEO } from "@/constants/seo"

export const metadata = generateSEO({
    title: "Dashboard",
    description: "Dashboard",
    image: "/logo.png",
    url: "/dashboard",
    type: "website",
});

const DashboardPage = () => {
    return (
        <AnalyticsDashboard />
    )
}

export default DashboardPage    