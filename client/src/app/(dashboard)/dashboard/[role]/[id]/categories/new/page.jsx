import AddCategory from '@/components/dashboard/categories/AddCategories'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Create Category - Dashboard",
    description: "Create category",
    image: "/logo.png",
    url: "/dashboard/categories/new",
    type: "website",
});

const page = () => {
    return (
        <AddCategory />
    )
}

export default page