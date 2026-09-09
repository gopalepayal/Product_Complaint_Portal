"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);

  // New Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      
      if (!res.ok) {
        setErrorMsg(result.error || "Failed to process request.");
        return;
      }
      
      setStep(2);
      setCooldown(60);
    } catch {
      setErrorMsg("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: code,
          purpose: "PASSWORD_RESET"
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || "Verification failed.");
        return;
      }

      setStep(3);
      setErrorMsg("");
    } catch {
      setErrorMsg("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "PASSWORD_RESET" })
      });
      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || "Failed to resend OTP.");
        return;
      }
      setCooldown(60);
      setErrorMsg("A new OTP has been sent.");
    } catch {
      setErrorMsg("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || "Failed to reset password.");
        return;
      }
      setStep(4);
    } catch {
      setErrorMsg("Network error.");
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
          
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Reset Password</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">
                Enter your registered email address and we&apos;ll send you instructions to reset your password.
              </p>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" 
                      placeholder="you@domain.com"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Verify your email</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">
                We've sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
              </p>

              {errorMsg && (
                <div className={`text-sm rounded-lg px-4 py-3 mb-6 ${errorMsg.includes("sent") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {errorMsg}
                </div>
              )}
              {!errorMsg && (
                <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 mb-6 border border-green-200">
                  OTP sent successfully to your email.
                </div>
              )}

              <div className="flex justify-between gap-2 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 border outline-none text-slate-900"
                  />
                ))}
              </div>

              <button 
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-70 mb-6"
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="text-center text-sm text-slate-600">
                Didn't receive the code?{" "}
                <button 
                  onClick={handleResendOtp} 
                  disabled={cooldown > 0 || isLoading}
                  className="font-semibold text-blue-700 hover:text-blue-800 transition-colors disabled:text-slate-400"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Set New Password</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">
                Verification successful! Please create a new password.
              </p>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSetNewPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" 
                      placeholder="••••••••" 
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" 
                      placeholder="••••••••" 
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-70 mt-4"
                >
                  {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Password Updated!</h3>
                <p className="text-slate-600 text-sm">
                  Your password has been changed successfully.
                </p>
              </div>
              
              <Link 
                href="/login" 
                className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-6"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
