import { getAllUsers } from '@/actions/user.action'
import AllUsers from '@/components/dashboard/users/AllUsers'

export const metadata = {
    title: "Users",
    description: "View and manage all users and their sub-users",
}

const page = async () => {
    const { data } = await getAllUsers();
    return (
        <AllUsers users={data} />
    )
}

export default page