
import { getFlatCategories } from "@/actions/category.action";
import { getPostById } from "@/actions/post.action";
import { getAllSeries } from "@/actions/series.action";
import { getAllTags } from "@/actions/tags.action";
import EditPost from "@/components/dashboard/posts/EditPosts";
import { notFound } from "next/navigation";
import { generateSEO } from "@/constants/seo";

export const metadata = generateSEO({
    title: "Edit Post - Dashboard",
    description: "Edit an existing post",
    image: "/logo.png",
    url: "/dashboard/posts/edit",
    type: "website",
});

const page = async ({ params }) => {
    const { postId } = await params;

    const [postRes, catRes, tagRes, seriesRes] = await Promise.all([
        getPostById(postId),
        getFlatCategories(),
        getAllTags(),
        getAllSeries(),
    ]);

    // Redirect to 404 if post not found
    if (!postRes?.data) notFound();

    return (
        <EditPost
            post={postRes.data}
            categories={catRes?.data ?? []}
            tags={tagRes?.data?.tags ?? []}
            series={seriesRes?.data?.series ?? []}
        />
    );
};

export default page;