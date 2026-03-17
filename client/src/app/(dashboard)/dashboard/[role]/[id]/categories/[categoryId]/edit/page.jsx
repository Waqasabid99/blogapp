import { getAllCategories, getCategoryById } from '@/actions/category.action'
import EditCategory from '@/components/dashboard/categories/EditCategory'

export const metadata = {
    title: "Edit Category - Dashboard",
    description: "Edit category",
}

const page = async ({ params }) => {
    const { categoryId } = await params
    const [category, allCategories] = await Promise.all([
        getCategoryById(categoryId),
        getAllCategories()
    ])
    return (
        <EditCategory category={category.data} allCategories={allCategories.data} />
    )
}

export default page