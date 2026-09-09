"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, Mail, Lock, CheckCircle, Eye, EyeOff, Shield } from "lucide-react";
import { signIn } from "next-auth/react";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Invalid email or password. Please try again.");
        setIsLoading(false);
      } else {
        setShowSuccessToast(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch {
      setServerError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-81px)] bg-white">

      {/* ── LEFT: Image Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-shrink-0">
        {/* Hero image */}
        <div className="absolute inset-0 bg-teal-800" />
        {/* Subtle dark gradient overlay — bottom-heavy so image stays visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

        {/* Trust message at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-white/80" />
            <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">
              Product Complaint Portal
            </span>
          </div>
          <p className="text-white text-2xl font-bold leading-snug mb-2">
            Your concerns.<br />Our responsibility.
          </p>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            A secure consumer portal to report, track, and resolve product grievances — handled with care and transparency.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {["Secure Handling", "Transparent Tracking", "Consumer Safety"].map(badge => (
              <span
                key={badge}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 sm:px-12 bg-slate-50">

        {/* Mobile image strip — shown only on small screens */}
        <div className="lg:hidden w-full h-48 relative rounded-2xl overflow-hidden mb-8 shadow-md">
          <div className="absolute inset-0 bg-teal-800" />
          <p className="absolute bottom-4 left-4 text-white text-base font-bold">
            Your concerns. Our responsibility.
          </p>
        </div>

        <div className="w-full max-w-md">

          {/* Portal brand */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Product Complaint Portal
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm mb-8">
            Log in to your consumer account to track complaints
          </p>

          {/* Registration success message */}
          {registered && (
            <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Registration successful! Please login to continue.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                  placeholder="you@domain.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>Login <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800 transition-colors">
              Register here
            </Link>
          </p>

          {/* Footer note */}
          <p className="mt-10 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
            © {new Date().getFullYear()} Product Complaint Portal. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Success Toast ── */}
      {showSuccessToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="font-medium text-sm">Login successful! Welcome back.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
