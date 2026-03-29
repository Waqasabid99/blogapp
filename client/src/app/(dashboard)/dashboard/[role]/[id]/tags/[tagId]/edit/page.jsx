import { getTagById } from '@/actions/tags.action';
import EditTag from '@/components/dashboard/tags/EditTag'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Edit Tag - Dashboard",
    description: "Edit tag",
    image: "/logo.png",
    url: "/dashboard/tags/edit",
    type: "website",
});

const page = async ({ params }) => {
    const { tagId } = await params;
    const data = await getTagById(tagId);
    return (
        <EditTag tag={data?.data} />
    )
}

export default page