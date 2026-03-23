import { getFlatCategories } from "@/actions/category.action"
import { getFeaturedPosts, getLatestPosts, getPinnedPosts, getTrendingPosts } from "@/actions/post.action"
import Hero from "@/components/pages/Home/Hero"
import LatestPosts from "@/components/pages/Home/LatestPosts";
import PostCategory from "@/components/pages/Home/PostCategory";
import TrendingPosts from "@/components/pages/Home/TrendingPosts";
import Newsletter from "@/components/pages/Home/Newsletter";
import { generateSEO } from "@/constants/seo";

export const metadata = generateSEO({
  title: "Newszone",
  description: "The Newszone blog - Your source for the latest news, insights, and stories.",
  image: "/logo.png",
  url: "/",
  type: "website",
});

const page = async () => {
  const [latest, featured, pinned, trending, categories] = await Promise.all([
    getLatestPosts(),
    getFeaturedPosts(),
    getPinnedPosts(),
    getTrendingPosts(),
    getFlatCategories()
  ]);

  const sliderPosts = [
    ...new Map(
      [...(pinned?.data || []), ...(featured?.data || [])]
        .map(post => [post.id, post])
    ).values()
  ].slice(0, 5);

  if (sliderPosts.length === 0) {
    sliderPosts.push(...(latest?.data || []).slice(0, 5));
  }

  if (sliderPosts.length === 0) return null;

  return (
    <>
      <Hero
        latestPosts={latest?.data}
        sliderPosts={sliderPosts}
      />
      <LatestPosts latestPosts={latest?.data} />
      <TrendingPosts trendingPosts={trending?.data?.posts} />
      <PostCategory categories={categories?.data} />
      <Newsletter />
    </>
  );
};

export default page