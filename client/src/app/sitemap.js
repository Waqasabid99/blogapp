export default async function sitemap() {
  // Use the API URL to fetch data, but use the SITE URL for the actual sitemap links.
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://newzone.com";

  // 1. Fetch dynamic posts safely
  let postUrls = [];
  try {
    const res = await fetch(`${API_URL}/post/published`, {
      next: { revalidate: 3600 }, // Cache the response for 1 hour to optimize performance
    });

    if (res.ok) {
      const posts = await res.json();
      if (posts?.data && Array.isArray(posts.data)) {
        postUrls = posts.data.map((post) => ({
          url: `${SITE_URL}/blog/${post?.categories?.[0]?.category?.slug ? post.categories[0].category.slug + '/' + post.slug : post.slug}`,
          lastModified: new Date(post.updatedAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error("Failed to fetch posts for sitemap:", error);
    // Continue executing so the static pages are still indexed even if the API is temporarily down
  }

  // 2. Define Static Routes
  const staticRoutes = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faqs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...postUrls];
}