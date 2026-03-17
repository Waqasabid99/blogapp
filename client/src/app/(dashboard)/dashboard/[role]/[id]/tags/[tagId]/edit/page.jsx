import { getTagById } from '@/actions/tags.action';
import EditTag from '@/components/dashboard/tags/EditTag'

export const metadata = {
    title: "Edit Tag - Dashboard",
    description: "Edit tag",
}

const page = async ({ params }) => {
    const { tagId } = await params;
    const data = await getTagById(tagId);
    return (
        <EditTag tag={data?.data} />
    )
}

export default page