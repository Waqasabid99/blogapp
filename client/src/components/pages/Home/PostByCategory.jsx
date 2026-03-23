import { getPostsByCategory } from "@/actions/post.action"
import { PostCard } from "@/components/ui/PostCard"
import Link from "next/link"

const PostByCategory = async ({ category }) => {
  const data = await getPostsByCategory(category?.slug)
  const posts = data?.data?.posts
  if (posts?.length === 0 || !posts) {
    return null
  }

  return (
    <section className='px-7 pb-12'>
      <Link href={`/blog/${category?.slug}`} className="heading-5 underline font-semibold pb-8">{category?.name}</Link>

      <div className="pg-grid mt-3">
        {posts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showActions={false}
            showCategories={true}
            showDate={true}
            showTags={false}
            showAuthor={false}
            showStatus={false}
          />
        ))}
      </div>
    </section>
  )
}

export default PostByCategory