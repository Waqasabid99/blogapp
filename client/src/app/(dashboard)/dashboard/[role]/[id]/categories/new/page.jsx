import { getAllCategories } from '@/actions/category.action'
import AddCategory from '@/components/dashboard/categories/AddCategories'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Create Category - Dashboard",
    description: "Create category",
    image: "/logo.png",
    url: "/dashboard/categories/new",
    type: "website",
});

const page = async () => {
    const categories = await getAllCategories();
    return (
        <AddCategory categories={categories.data} />
    )
}

export default page