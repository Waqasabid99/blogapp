import ForgotPassword from '@/components/pages/ForgotPassword'
import { generateSEO } from '@/constants/seo'

export const metadata = generateSEO({
  title: "Forgot Password - BlogSite",
  description: "Forgot your password? Reset it here",
  image: "/logo.png",
  url: "/forgot-password",
  type: "website",
});

const page = () => {
  return (
    <ForgotPassword />
  )
}

export default page