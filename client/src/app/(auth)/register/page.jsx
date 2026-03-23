import Register from '@/components/pages/Register'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
  title: "Register - BlogSite",
  description: "Register for a new account",
  image: "/logo.png",
  url: "/register",
  type: "website",
});

const page = () => {
  return (
    <Register />
  )
}

export default page