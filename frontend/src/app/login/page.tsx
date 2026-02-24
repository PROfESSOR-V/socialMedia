"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { ArrowRight, Mail, Lock } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setLogin = useStore((state) => state.setLogin);

  const registered = searchParams.get("registered");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      
      if (data.token) {
        setLogin(data.token, { id: "", email, role: data.role || "CUSTOMER" });
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.status === 403 ? "Invalid credentials." : "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
      {registered && (
          <div className="p-3 rounded-md bg-green-50 text-green-700 border border-green-100 text-sm break-words">
            Account created successfully! Please sign in.
          </div>
      )}
      {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-600 border border-red-100 text-sm break-words">
            {error}
          </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-zinc-200 placeholder-zinc-400 text-zinc-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:z-10 sm:text-sm bg-zinc-50/50 transition-all"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
              Password
            </label>
            <div className="text-sm">
              <a href="#" className="font-medium text-black hover:text-black/80 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-zinc-200 placeholder-zinc-400 text-zinc-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:z-10 sm:text-sm bg-zinc-50/50 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 text-black focus:ring-black border-zinc-300 rounded cursor-pointer accent-black"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-600 cursor-pointer">
          Remember me for 30 days
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 -mr-1 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fefdfb] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] border border-black/5 relative overflow-hidden">
        
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute left-0 bottom-0 -ml-16 -mb-16 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <div className="text-center">
            <Link 
              href="/" 
              className="font-serif text-3xl font-medium tracking-tight text-black inline-block mb-2 hover:opacity-80 transition-opacity"
            >
              AÚRELYÑ
            </Link>
            <h2 className="mt-6 text-2xl font-serif text-zinc-900 mb-2">Welcome back</h2>
            <p className="text-sm text-zinc-500">
              Please enter your details to sign in
            </p>
          </div>

          <Suspense fallback={<div className="mt-10 flex justify-center"><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /></div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 text-center pt-6 border-t border-zinc-100">
            <p className="text-sm text-zinc-600">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-black hover:underline underline-offset-4 transition-all">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
