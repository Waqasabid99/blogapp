import { getAllCategories } from "@/actions/category.action"
import { getFeaturedPosts, getLatestPosts, getPinnedPosts, getPublishedPosts } from "@/actions/post.action"
import { getAllTags } from "@/actions/tags.action"
import Hero from "@/components/pages/Home/Hero"
import LatestPosts from "@/components/pages/Home/LatestPosts";

const page = async () => {
  const [latest, featured, pinned] = await Promise.all([
    getLatestPosts(),
    getFeaturedPosts(),
    getPinnedPosts()
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
    <LatestPosts />
    </>
  );
};

export default page