// seo-post.js
import { generateSEO, siteMetadata } from "./seo";

/**
 * Generate SEO metadata from Prisma Post
 */
export function generatePostSEO(post) {
    if (!post) return generateSEO();

    const {
        title,
        slug,
        excerpt,
        coverImage,
        author,
        categories,
        tags,
        createdAt,
        publishedAt,
        seo,
    } = post;

    // ✅ Prefer SEO overrides if available
    const metaTitle = seo?.metaTitle || title;
    const metaDescription = seo?.metaDescription || excerpt;

    // ✅ Canonical URL
    const url = seo?.canonicalUrl || `/blog/${slug}`;

    // ✅ Image handling
    const image =
        coverImage?.url || siteMetadata.socialBanner;

    // ✅ Author formatting
    const authors = author
        ? [
            {
                name: author.name,
                url: `${siteMetadata.siteUrl}/author/${author.id}`,
            },
        ]
        : undefined;

    // ✅ Category (use first one as primary)
    const section =
        categories?.[0]?.category?.name || "Blog";

    // ✅ Tags
    const tagList =
        tags?.map((t) => t.tag.name) || [];

    // ✅ Keywords (for metadata)
    const keywords = tagList;

    return generateSEO({
        title: metaTitle,
        description: metaDescription,
        url,
        image,
        type: "article",

        // Dates
        date: publishedAt || createdAt,

        // Author
        authors,

        // Article SEO
        section,
        tags: tagList,

        // Keywords (optional)
        keywords,

        // OpenGraph overrides (optional fine tuning)
        openGraph: {
            ...(seo?.canonicalUrl && {
                url: seo.canonicalUrl,
            }),
        },
    });
}