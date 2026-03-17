import EditUser from '@/components/dashboard/users/EditUsers'
import { getAllRoles } from '@/actions/role.action'
import { getUserById } from '@/actions/user.action';

export const metadata = {
    title: "Edit User - Dashboard",
    description: "Edit user",
}

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