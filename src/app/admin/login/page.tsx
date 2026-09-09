"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, Mail, Lock, AlertTriangle, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";

// ─── FORGOT PASSWORD FLOW ─────────────────────────────────────────────────────
function ForgotPasswordFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"email" | "otp" | "password" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Step 1 — send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP."); return; }
      setInfo("A 6-digit OTP has been sent to your email.");
      setStep("otp");
    } catch { setError("Network error. Please try again."); }
    finally { setIsLoading(false); }
  };

  // Step 2 — verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "PASSWORD_RESET" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid OTP."); return; }
      setInfo("");
      setStep("password");
    } catch { setError("Network error. Please try again."); }
    finally { setIsLoading(false); }
  };

  // Step 3 — set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to reset password."); return; }
      setStep("done");
    } catch { setError("Network error. Please try again."); }
    finally { setIsLoading(false); }
  };

  const stepLabel = step === "email" ? "Enter your admin email"
    : step === "otp" ? "Enter verification code"
    : step === "password" ? "Set new password"
    : "Password reset!";

  return (
    <div className="space-y-6">
      {/* Back button */}
      {step !== "done" && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </button>
      )}

      <div>
        <h2 className="text-white text-2xl font-bold mb-1">Forgot Password</h2>
        <p className="text-slate-400 text-sm">{stepLabel}</p>
      </div>

      {/* Progress dots */}
      {step !== "done" && (
        <div className="flex gap-2">
          {(["email", "otp", "password"] as const).map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
              step === s ? "bg-blue-500" :
              (step === "otp" && s === "email") || (step === "password") ? "bg-blue-700" : "bg-slate-700"
            }`} />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {info && (
        <div className="flex items-start gap-3 bg-blue-950/60 border border-blue-800 text-blue-300 text-sm rounded-xl px-4 py-3">
          <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{info}</span>
        </div>
      )}

      {/* STEP 1 — Email */}
      {step === "email" && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Admin Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus
                placeholder="gopalepayal449@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60">
            {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : "Send Verification Code"}
          </button>
        </form>
      )}

      {/* STEP 2 — OTP */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">6-Digit OTP</label>
            <input
              type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required maxLength={6} autoFocus
              placeholder="• • • • • •"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-center text-xl font-mono tracking-[0.5em] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <p className="text-slate-500 text-xs mt-2">Check your inbox at <span className="text-slate-300">{email}</span></p>
          </div>
          <button type="submit" disabled={isLoading || otp.length !== 6}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60">
            {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : "Verify OTP"}
          </button>
          <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); }}
            className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Resend OTP
          </button>
        </form>
      )}

      {/* STEP 3 — New Password */}
      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showPw ? "text" : "password"} value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required minLength={8} autoFocus
                placeholder="Min 8 characters"
                className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showPw ? "text" : "password"} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required minLength={8}
                placeholder="Repeat new password"
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60">
            {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <><KeyRound className="h-4 w-4" /> Reset Password</>}
          </button>
        </form>
      )}

      {/* STEP 4 — Done */}
      {step === "done" && (
        <div className="text-center space-y-4 py-4">
          <div className="flex justify-center">
            <div className="bg-green-600/20 border border-green-500/30 p-4 rounded-full">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </div>
          <p className="text-white font-bold text-lg">Password Reset Successful!</p>
          <p className="text-slate-400 text-sm">Your admin password has been updated. You can now sign in with your new password.</p>
          <button onClick={onBack}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-2">
            <Shield className="h-4 w-4" /> Back to Admin Login
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN LOGIN FORM ──────────────────────────────────────────────────────────
function AdminLoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(
    errorParam === "unauthorized" ? "Access denied. This portal is for administrators only." : ""
  );
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        setAuthError("Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/admin/stats");
      if (res.status === 403 || res.status === 401) {
        setAuthError("Access denied. This login is for administrators only.");
        setIsLoading(false);
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch {
      setAuthError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative w-full max-w-md">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Admin Portal</p>
                <h1 className="text-white text-xl font-bold leading-tight">TrustPortal</h1>
              </div>
            </div>

            {/* ── Forgot Password Flow ── */}
            {showForgot ? (
              <ForgotPasswordFlow onBack={() => setShowForgot(false)} />
            ) : (
              <>
                <h2 className="text-white text-2xl font-bold text-center mb-1">Administrator Login</h2>
                <p className="text-slate-400 text-sm text-center mb-8">Restricted access. Authorised personnel only.</p>

                {authError && (
                  <div className="mb-6 flex items-start gap-3 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="admin@yourportal.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="••••••••••"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <><Shield className="h-4 w-4" /> Sign In to Admin Panel</>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                  <p className="text-slate-500 text-xs">
                    This is a secure administrative area. Unauthorised access is strictly prohibited.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          Are you a consumer?{" "}
          <a href="/login" className="text-slate-400 hover:text-white transition-colors font-medium">
            Consumer Login →
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
