
import { getFlatCategories } from "@/actions/category.action";
import { getPostById } from "@/actions/post.action";
import { getAllSeries } from "@/actions/series.action";
import EditPost from "@/components/dashboard/posts/EditPosts";
import { notFound } from "next/navigation";
import { generateSEO } from "@/constants/seo";
import { getAllTags } from "@/actions/tags.server.action";

export const metadata = generateSEO({
    title: "Edit Post - Dashboard",
    description: "Edit an existing post",
    image: "/logo.png",
    url: "/dashboard/posts/edit",
    type: "website",
});

const page = async ({ params }) => {
    const { postId } = await params;

    const [catRes, tagRes, seriesRes] = await Promise.all([
        getFlatCategories(),
        getAllTags(),
        getAllSeries(),
    ]);

    return (
        <EditPost
            postId={postId}
            categories={catRes?.data ?? []}
            tags={tagRes?.data?.tags ?? []}
            series={seriesRes?.data?.series ?? []}
        />
    );
};

export default page;