import { getAllCategories, getCategoryById } from '@/actions/category.action'
import EditCategory from '@/components/dashboard/categories/EditCategory'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Edit Category - Dashboard",
    description: "Edit category",
    image: "/logo.png",
    url: "/dashboard/categories/edit",
    type: "website",
});

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