import AllUsers from '@/components/dashboard/users/AllUsers'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Users",
    description: "View and manage all users and their sub-users",
    image: "/logo.png",
    url: "/dashboard/users",
    type: "website",
});

const page = () => {
    return (
        <AllUsers />
    )
}

export default page