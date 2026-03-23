// seo.js

export const siteMetadata = {
    title: "Newszone",
    author: "Newszone",
    headerTitle: "Newszone Blog",
    description:
        "The Newszone blog - Your source for the latest news, insights, and stories.",
    language: "en-us",
    theme: "system",
    siteUrl: "https://newszone.com",
    siteLogo: "/logo.png",
    socialBanner: "/social-banner.png",
    email: "hello@newszone.com",
    github: "https://github.com/your-username",
    twitter: "https://twitter.com/your-username",
    facebook: "https://facebook.com/your-page",
    youtube: "https://youtube.com/your-channel",
    linkedin: "https://www.linkedin.com/in/your-profile",
    locale: "en-US",
};

/**
 * Safely extract Twitter handle from URL
 */
const getTwitterHandle = (url) => {
    try {
        const { pathname } = new URL(url);
        return pathname ? `@${pathname.replace("/", "")}` : undefined;
    } catch {
        return undefined;
    }
};

/**
 * Generate JSON-LD structured data
 */
const generateJsonLd = ({
    title,
    description,
    image,
    url,
    date,
    authors,
    section,
    tags,
}) => {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image,
        url,
        datePublished: date,
        author: authors?.map((a) => ({
            "@type": "Person",
            name: a.name || a,
        })),
        articleSection: section,
        keywords: tags?.join(", "),
    };
};

/**
 * Main SEO Generator
 */
export function generateSEO({
    title,
    description,
    image,
    url,
    type = "website",
    date,
    authors,
    keywords = [],
    section, // article section
    tags = [], // article tags
    ...rest
} = {}) {
    const seoTitle = title
        ? `${title} | ${siteMetadata.title}`
        : siteMetadata.title;

    const seoDescription = description || siteMetadata.description;

    const seoUrl = url
        ? `${siteMetadata.siteUrl}${url}`
        : siteMetadata.siteUrl;

    const seoImage = image || siteMetadata.socialBanner;

    const ogImageUrl = seoImage.startsWith("http")
        ? seoImage
        : `${siteMetadata.siteUrl}${seoImage}`;

    const twitterHandle = getTwitterHandle(siteMetadata.twitter);

    // JSON-LD structured data
    const jsonLd =
        type === "article"
            ? generateJsonLd({
                title: seoTitle,
                description: seoDescription,
                image: ogImageUrl,
                url: seoUrl,
                date,
                authors,
                section,
                tags,
            })
            : null;

    return {
        metadataBase: new URL(siteMetadata.siteUrl),

        title: seoTitle,
        description: seoDescription,

        applicationName: siteMetadata.title,
        authors: authors || [
            { name: siteMetadata.author, url: siteMetadata.siteUrl },
        ],
        generator: "Next.js",
        keywords: ["Blog", "News", "Articles", ...keywords],
        referrer: "origin-when-cross-origin",
        creator: siteMetadata.author,
        publisher: siteMetadata.author,

        // Icons & Manifest
        icons: {
            icon: "/favicon.ico",
            apple: "/apple-touch-icon.png",
        },
        manifest: "/site.webmanifest",

        // Open Graph
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            url: seoUrl,
            siteName: siteMetadata.title,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title || siteMetadata.title,
                },
            ],
            locale: siteMetadata.locale,
            type,
            ...(type === "article" && {
                publishedTime: date
                    ? new Date(date).toISOString()
                    : undefined,
                authors: authors?.map((a) => a.name || a),
                section,
                tags,
            }),
            ...rest.openGraph,
        },

        // Twitter
        twitter: {
            card: "summary_large_image",
            title: seoTitle,
            description: seoDescription,
            images: [ogImageUrl],
            creator: twitterHandle,
            site: twitterHandle,
            ...rest.twitter,
        },

        // Canonical
        alternates: {
            canonical: seoUrl,
            ...rest.alternates,
        },

        // Robots
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
            ...rest.robots,
        },

        // Viewport & Theme
        viewport: "width=device-width, initial-scale=1",
        // Structured Data (custom field, inject manually)
        other: {
            ...(jsonLd && {
                "script:ld+json": JSON.stringify(jsonLd),
            }),
        },

        ...rest,
    };
}