
import { getPostsByCategory } from "@/actions/post.action";
import CategoryPage from "@/components/pages/CategoryPage";
import { EmptyState } from "@/components/ui/PostCard";
import { generateSEO } from "@/constants/seo";

export async function generateMetadata({ params }) {
    const { category } = await params;
    return generateSEO({
        title: category.toUpperCase(),
        description: `All the latest ${category} news and articles`,
        image: "/logo.png",
        url: `/blog/${category}`,
        type: "website",
    })
}

const page = async function page({ params }) {
    const { category } = await params
    const posts = await getPostsByCategory(category)
    if (!posts?.data?.posts?.length) {
        return (
            <>
                <EmptyState text="No posts found" subText="No posts found in this category" />
            </>
        )
    }
    return (
        <CategoryPage posts={posts?.data?.posts} pagination={posts?.data?.pagination} category={category} />
    );
}

export default page;