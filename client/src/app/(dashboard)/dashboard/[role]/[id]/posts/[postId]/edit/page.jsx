import { getAllCategories } from "@/actions/category.action"
import { getAllSeries } from "@/actions/series.action"
import { getAllTags } from "@/actions/tags.action"
import EditPost from "@/components/dashboard/posts/EditPosts"

const page = async ({ params }) => {
    const { postId } = await params
    const [categories, tags, series] = await Promise.all([
        getAllCategories(),
        getAllTags(),
        getAllSeries(),
    ])
  return (
    <EditPost postId={postId} categories={categories?.data} tags={tags?.data?.tags} series={series?.data} />
  )
}

export default page