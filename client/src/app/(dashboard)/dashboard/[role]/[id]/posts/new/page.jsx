import { getFlatCategories } from "@/actions/category.action";
import { getAllSeries } from "@/actions/series.action";
import { getAllTags } from "@/actions/tags.action";
import AddPost from "@/components/dashboard/posts/AddPosts";
import { generateSEO } from "@/constants/seo";

export const metadata = generateSEO({
    title: "Create Post - Dashboard",
    description: "Create a new post",
    image: "/logo.png",
    url: "/dashboard/posts/new",
    type: "website",
});

export default async function CreatePostPage() {
    const [categories, tags, series] = await Promise.all([
        getFlatCategories(),
        getAllTags(),
        getAllSeries(),
    ]);

    return <AddPost categories={categories?.data} tags={tags?.data?.tags} series={series?.data?.series} />;
}