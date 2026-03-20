import { getPostById, getRelatedPosts } from "@/actions/post.action";
import ViewPost from "@/components/pages/SinglePost"

const page = async ({ params }) => {
    const { postId } = await params;

    const post = await getPostById(postId);
    const relatedPosts = await getRelatedPosts(post?.data?.categoryId, post?.data?.id, 3);
  return (
    <ViewPost post={post?.data} relatedPosts={relatedPosts?.data} />
  )
}

export default page