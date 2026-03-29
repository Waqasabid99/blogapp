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
    return (
        <EditCategory categoryId={categoryId} />
    )
}

export default page