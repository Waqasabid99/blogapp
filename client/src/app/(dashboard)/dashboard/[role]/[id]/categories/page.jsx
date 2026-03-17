import { getAllCategories } from '@/actions/category.action';
import AllCategories from '@/components/dashboard/categories/AllCategories'

export const metadata = {
    title: "Categories - Dashboard",
    description: "View and manage categories and their sub-categories",
}

const page = async () => {
    const categories = await getAllCategories();
    return (
        <AllCategories categories={categories} />
    )
}

export default page