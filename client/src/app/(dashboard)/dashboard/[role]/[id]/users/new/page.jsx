import AddUser from "@/components/dashboard/users/AddUsers"
import { generateSEO } from "@/constants/seo"

export const metadata = generateSEO({
  title: "Create User - Dashboard",
  description: "Create user",
  image: "/logo.png",
  url: "/dashboard/users/new",
  type: "website",
})

const page = async () => {
  return (
    <AddUser />
  )
}

export default page