import AddTag from '@/components/dashboard/tags/AddTag'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Create Tag - Dashboard",
    description: "Create tag",
    image: "/logo.png",
    url: "/dashboard/tags/new",
    type: "website",
});

const page = async () => {
    return (
        <AddTag />
    )
}

export default page