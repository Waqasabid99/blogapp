import { getRelatedPosts, getSinglePost } from "@/actions/post.action";
import ViewPost from "@/components/pages/SinglePost"
import { generatePostSEO } from "@/constants/seo-post";

export async function generateMetadata({ params }) {
    const { category } = await params;
    const post = await getSinglePost(category);

    return generatePostSEO(post?.data);
}

const page = async ({ params }) => {
    const { category } = await params;
    const post = await getSinglePost(category);
    const relatedPosts = await getRelatedPosts(post?.data?.categoryId, post?.data?.id, 3);
    const seo = generatePostSEO(post?.data)

    return (
        <>
            {seo.other?.["script:ld+json"] && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: seo.other["script:ld+json"],
                    }}
                />
            )}
            <ViewPost post={post?.data} relatedPosts={relatedPosts?.data} />
        </>
    )
}

export default page