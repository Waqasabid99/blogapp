import { getFlatCategories } from "@/actions/category.action";
import { getAllTags } from "@/actions/tags.action";
import PostGrid from "@/components/ui/PostGrid";

const page = async function page() {
  const [{ data: catData }, { data: tagData }] = await Promise.all([
    getFlatCategories(),
    getAllTags(),
  ]);

  return (
    <PostGrid
      categories={catData?.data ?? []}
      tags={tagData?.data?.tags ?? []}
    />
  );
}

export default page;