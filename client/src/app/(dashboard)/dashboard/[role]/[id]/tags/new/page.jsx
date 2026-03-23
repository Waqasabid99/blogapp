import { getAllTags } from '@/actions/tags.action'
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
    const { data } = await getAllTags();
    return (
        <AddTag tags={data?.tags} />
    )
}

export default page