import AllTags from '@/components/dashboard/tags/AllTags'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Tags - Dashboard",
    description: "View and manage all tags and their sub-tags",
    image: "/logo.png",
    url: "/dashboard/tags",
    type: "website",
});

const page = async () => {
    return (
        <AllTags />
    )
}

export default page