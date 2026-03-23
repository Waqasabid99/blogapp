import { getAllUsers } from '@/actions/user.action'
import AllUsers from '@/components/dashboard/users/AllUsers'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
    title: "Users",
    description: "View and manage all users and their sub-users",
    image: "/logo.png",
    url: "/dashboard/users",
    type: "website",
});

const page = async () => {
    const { data } = await getAllUsers();
    return (
        <AllUsers users={data} />
    )
}

export default page