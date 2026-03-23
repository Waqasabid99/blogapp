import Login from '@/components/pages/Login'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
  title: "Login - BlogSite",
  description: "Login to your account",
  image: "/logo.png",
  url: "/login",
  type: "website",
});

const page = () => {
  return (
    <Login />
  )
}

export default page