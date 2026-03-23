import { EmptyState, PostCard } from "@/components/ui/PostCard";

const LatestPosts = ({ latestPosts }) => {
  if (!latestPosts || latestPosts.length === 0) {
    return (
      <section className="px-7 py-12">
        <h2 className="heading-2 font-serif pb-8">Latest Posts</h2>
        <EmptyState
          text="No Latest Posts found"
          subText="New Posts will be shown here as they are posted"
        />
      </section>
    );
  }

  return (
    <section className="px-7 py-12">
      <h2 className="heading-2 font-serif pb-8">Latest Posts</h2>

      <div className="pg-grid">
        {latestPosts.slice(0, 9).map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
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
  );
};

export default LatestPosts;