"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Registration failed. Please try again.");
        return;
      }

      window.location.href = "/login?registered=1";
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-10 w-10 text-blue-700" />
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                Trust<span className="text-blue-700">Portal</span>
              </span>
            </div>
          </div>
          
          <>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Create an Account</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">Register as a consumer to submit and track complaints</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {serverError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {serverError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      {...register("fullName")}
                      className="w-full pl-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" 
                      placeholder="John Doe" 
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="email"
                      {...register("email")}
                      className="w-full pl-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" 
                      placeholder="you@domain.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      {...register("password")}
                      className="w-full pl-10 pr-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      {...register("confirmPassword")}
                      className="w-full pl-10 pr-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-70 mt-4"
                >
                  {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <>Register Account <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>
              </form>
              
              <div className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800 transition-colors">
                  Sign in here
                </Link>
              </div>
          </>
        </div>
      </div>
    </div>
  );
}

