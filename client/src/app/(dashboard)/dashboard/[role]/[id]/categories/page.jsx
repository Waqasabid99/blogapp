import AllCategories from '@/components/dashboard/categories/AllCategories'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Categories - Dashboard",
    description: "View and manage categories and their sub-categories",
    image: "/logo.png",
    url: "/dashboard/categories",
    type: "website",
});

const page = () => {
    return (
        <AllCategories />
    )
}

export default page