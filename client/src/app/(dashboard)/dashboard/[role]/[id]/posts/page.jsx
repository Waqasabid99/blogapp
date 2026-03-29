import { getFlatCategories } from "@/actions/category.action";
import { getAllTags } from "@/actions/tags.server.action";
import PostGrid from "@/components/ui/PostGrid";
import { generateSEO } from "@/constants/seo";

export const metadata = generateSEO({
  title: "Posts - Dashboard",
  description: "View and manage all posts",
  image: "/logo.png",
  url: "/dashboard/posts",
  type: "website",
});

const page = async function page({ params }) {
  const { role } = await params;
  const [{ data: catData }, { data: tagData }] = await Promise.all([
    getFlatCategories(),
    getAllTags(),
  ]);

  return (
    <PostGrid
      categories={catData?.data ?? []}
      tags={tagData?.data?.tags ?? []}
      role={role}
    />
  );
}

export default page;