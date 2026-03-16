"use client";
import useAuthStore from "@/store/authStore";
import { EyeClosed, EyeIcon, MailIcon, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Loader from "../ui/Loader";
import { useRouter } from "next/navigation";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { isLoading, login, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted", formData);
    const res = await login(formData);
    if (res?.success) {
      setFormData({
        email: "",
        password: "",
      });
      router.push("/");
    }
  };

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center px-4 py-22 bg-(--bg-light)
      "
    >
      <div
        className="
          w-full max-w-5xl
          flex flex-col lg:flex-row
          items-center justify-between
          gap-10
        "
      >
        <div className="w-full lg:w-2/5 text-center lg:text-left">
          <h1 className="heading-1 font-mono py-3 text-3xl sm:text-4xl lg:text-5xl">
            Welcome back
          </h1>
          <p className="text-(--text-secondary) font-mono text-sm leading-relaxed">
            By continuing with the sign in or registration, you agree to our
            Terms &amp; Conditions, and Privacy Statement.
          </p>
          <span className="block w-full h-px border-b-2 pb-8 mt-4" />
          <p className="text-(--text-secondary) font-mono text-sm py-5">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="link font-semibold underline underline-offset-2"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Form card */}
        <div className="w-full lg:w-3/5 flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="
              w-full max-w-md
              bg-(--bg-primary)
              flex flex-col gap-4
              p-6 sm:p-9
              border border-(--border-light)
              rounded-lg
              shadow-(--shadow-md)
            "
          >
            <p className="text-center text-sm text-(--text-secondary) leading-relaxed">
              Enter your email address and continue with your password or sign
              in with Google.
            </p>
                        
            {/* Error message */}
            {error && (
              <div className="relative">
                <p
                  className="text-sm bg-red-500 text-white py-2 rounded text-center"
                  role="alert"
                >
                  {error}
                </p>
                <X
                  size={18}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white cursor-pointer"
                  onClick={clearError}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label mb-1">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleChange}
                  maxLength={40}
                  required
                  className="form-input pr-10"
                />
                <MailIcon
                  size={18}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  onChange={handleChange}
                  required
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-(--text-muted) hover:text-(--text-primary) transition-colors"
                >
                  {showPassword ? (
                    <EyeIcon size={18} />
                  ) : (
                    <EyeClosed size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="relative py-2">
            {/* Forgot password */}
            <Link
              href="/forgot-password"
              className="link font-semibold absolute top-0 right-0 -translate-y-1"
            >
              Forgot password?
            </Link>
            </div>
            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full mt-1"
              aria-label="Submit login form"
            >
              {isLoading ? <Loader size="sm" text="Logging in..." /> : "Login"}
            </button>

            {/* Divider */}
          <div className="flex items-center gap-3 my-2 text-(--text-secondary)">
            <span className="flex-1 h-px bg-(--bg-tertiary)" />
            <span className="text-sm">or</span>
            <span className="flex-1 h-px bg-(--bg-tertiary)" />
          </div>

            {/* Social buttons */}
            <button
              type="button"
              className="btn btn-dark w-full"
              aria-label="Continue with Google"
            >
              Continue with Google
            </button>
            <button
              type="button"
              className="btn btn-outline w-full"
              aria-label="Continue with Apple"
            >
              Continue with Apple
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
