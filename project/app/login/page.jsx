"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChefHat, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      router.push(
        loggedInUser.role === "provider"
          ? "/dashboard"
          : loggedInUser.role === "delivery_partner"
            ? "/delivery"
            : "/",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8"
          aria-label="Go to homepage"
        >
          <div className="w-10 h-10 bg-[#EA580C] rounded-xl flex items-center justify-center">
            <ChefHat size={22} color="white" aria-hidden="true" />
          </div>
          <span className="font-heading font-bold text-2xl text-[#0F172A]">
            Mom&apos;s Magic
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm p-8">
          <h1 className="font-heading font-bold text-2xl text-[#0F172A] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[#64748B] mb-6">
            Log in to order your daily meals
          </p>

          {error && (
            <div
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5"
              role="alert"
            >
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#0F172A] mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm border border-[#FCEAE1] rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#0F172A] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full text-sm border border-[#FCEAE1] rounded-xl px-4 py-3 pr-11 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] cursor-pointer p-1"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EA580C] text-white font-bold py-3 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#EA580C] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
