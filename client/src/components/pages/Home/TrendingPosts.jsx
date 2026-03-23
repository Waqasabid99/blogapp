import { PostCard } from "@/components/ui/PostCard";

const TrendingPosts = ({ trendingPosts }) => {
  if (!trendingPosts || trendingPosts.length === 0) {
    return null;
  }

  return (
    <section className="px-7 pb-12">
      <h2 className="heading-2 font-serif pb-8">Trending this week</h2>

      <div className="pg-grid">
        {trendingPosts.slice(0, 9).map((post) => (
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

export default TrendingPosts;