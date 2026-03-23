import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Comments - Dashboard",
    description: "View and manage all comments",
    image: "/logo.png",
    url: "/dashboard/comments",
    type: "website",
});

const page = () => {
    return (
        <div>page</div>
    )
}

export default page