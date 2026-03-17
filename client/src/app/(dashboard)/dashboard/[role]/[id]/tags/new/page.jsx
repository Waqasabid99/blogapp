import { getAllTags } from '@/actions/tags.action'
import AddTag from '@/components/dashboard/tags/AddTag'

export const metadata = {
    title: "Create Tag - Dashboard",
    description: "Create tag",
}

const page = async () => {
    const { data } = await getAllTags();
    return (
        <AddTag tags={data?.tags} />
    )
}

export default page