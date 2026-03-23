import { getAllTags } from '@/actions/tags.action';
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
    const tags = await getAllTags();
    return (
        <AllTags tags={tags?.data} />
    )
}

export default page