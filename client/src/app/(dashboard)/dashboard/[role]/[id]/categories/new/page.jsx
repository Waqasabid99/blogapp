import { getAllCategories } from '@/actions/category.action'
import AddCategory from '@/components/dashboard/categories/AddCategories'

export const metadata = {
    title: "Create Category - Dashboard",
    description: "Create category",
}

const page = async () => {
    const categories = await getAllCategories();
    return (
        <AddCategory categories={categories.data} />
    )
}

export default page