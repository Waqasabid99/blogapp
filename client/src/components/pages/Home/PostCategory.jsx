import PostByCategory from './PostByCategory'

const PostCategory = async ({ categories }) => {
  return (
    <section>
      {categories?.slice(0, 15).map((category) => (
        <PostByCategory key={category.id} category={category} />
      ))}
    </section>
  )
}

export default PostCategory