import { getAllRoles } from "@/actions/role.action"
import AddUser from "@/components/dashboard/users/AddUsers"

export const metadata = {
    title: "Create User - Dashboard",
    description: "Create user",
}
const page = async () => {
    const {data} = await getAllRoles();
  return (
    <AddUser roles={data}/>
  )
}

export default page