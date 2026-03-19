import { getAllTags } from '@/actions/tags.action';
import AllTags from '@/components/dashboard/tags/AllTags'

export const metadata = {
    title: "Tags - Dashboard",
    description: "View and manage all tags and their sub-tags",
}

const page = async () => {
    const tags = await getAllTags();
    console.log(tags)
    return (
        <AllTags tags={tags?.data} />
    )
}

export default page