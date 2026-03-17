"use client";
import useAuthStore from "@/store/authStore";
import { EyeClosed, EyeIcon, MailIcon, User2Icon, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Loader from "../ui/Loader";
import { useRouter } from "next/navigation";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [mismatchError, setMismatchError] = useState("");
  const { isLoading, register, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (mismatchError) setMismatchError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMismatchError("Passwords do not match");
      return;
    }

    const res = await register(formData);
    if (res?.success) {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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
            Register Now
          </h1>
          <p className="text-(--text-secondary) font-mono text-sm leading-relaxed">
            By continuing, you agree to our Terms & Conditions, opens new tab
            and Privacy Statement, opens new tab
          </p>
          <span className="block w-full h-px border-b-2 pb-8 mt-4" />
          <p className="text-(--text-secondary) font-mono text-sm py-5">
            Already have an account?{" "}
            <Link
              href="/login"
              className="link font-semibold underline underline-offset-2"
            >
              Login here
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
              Enter your email address and continue with your password or
              register with Google.
            </p>
            
            {/* Error message */}
            {(error || mismatchError) && (
              <div className="relative">
                <p
                  className="text-sm bg-red-500 text-white py-2 rounded text-center"
                  role="alert"
                >
                  {mismatchError || error}
                </p>
                <X
                  size={18}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white cursor-pointer"
                  onClick={() => {
                    setMismatchError("");
                    clearError();
                  }}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label mb-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="name"
                  name="name"
                  id="name"
                  onChange={handleChange}
                  maxLength={40}
                  className="form-input pr-10"
                />
                <User2Icon
                  size={18}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                />
              </div>
            </div>

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

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  onChange={handleChange}
                  required
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-(--text-muted) hover:text-(--text-primary) transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeIcon size={18} />
                  ) : (
                    <EyeClosed size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full mt-1"
              aria-label="Submit login form"
            >
              {isLoading ? (
                <Loader size="sm" text="Signing up..." />
              ) : (
                "Sign up"
              )}
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

export default Register;
