import { getFlatCategories } from "@/actions/category.action";
import { getAllSeries } from "@/actions/series.action";
import { getAllTags } from "@/actions/tags.action";
import AddPost from "@/components/dashboard/posts/AddPosts";

export default async function CreatePostPage() {
    const [categories, tags, series] = await Promise.all([
        getFlatCategories(),
        getAllTags(),
        getAllSeries(),
    ]);

    return <AddPost categories={categories?.data} tags={tags?.data} series={series?.data} />;
}