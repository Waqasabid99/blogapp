import EditUser from '@/components/dashboard/users/EditUsers'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Edit User - Dashboard",
    description: "Edit user",
    image: "/logo.png",
    url: "/dashboard/users/edit",
    type: "website",
});

const page = async ({ params }) => {
    const { userId } = await params;

    return (
        <EditUser userId={userId} />
    )
}

export default page