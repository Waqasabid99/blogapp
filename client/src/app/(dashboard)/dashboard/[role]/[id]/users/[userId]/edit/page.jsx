import EditUser from '@/components/dashboard/users/EditUsers'
import { getAllRoles } from '@/actions/role.action'
import { getUserById } from '@/actions/user.action';
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
    const [roles, user] = await Promise.all([
        getAllRoles(),
        getUserById(userId)
    ])
    return (
        <EditUser user={user?.data} roles={roles?.data} />
    )
}

export default page