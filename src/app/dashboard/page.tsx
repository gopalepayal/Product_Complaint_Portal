"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck, FileText, Plus, Search, Clock, CheckCircle,
  AlertCircle, XCircle, ChevronRight, LogOut, User,
  LayoutDashboard, Bell, HelpCircle, Filter, RefreshCw,
  Package, TrendingUp, Activity
} from "lucide-react";
import { signOut } from "next-auth/react";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  SUBMITTED:              { label: "Submitted",               color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  UNDER_REVIEW:           { label: "Under Review",            color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  MORE_INFO_REQUIRED:     { label: "Action Required",         color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  VERIFIED:               { label: "Verified",                color: "bg-teal-100 text-teal-700",   dot: "bg-teal-500" },
  SENT_TO_BRAND:          { label: "Sent to Brand",           color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  BRAND_RESPONSE:         { label: "Brand Responded",         color: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  RESOLUTION_IN_PROGRESS: { label: "In Progress",            color: "bg-sky-100 text-sky-700",     dot: "bg-sky-500" },
  RESOLVED:               { label: "Resolved",               color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  CLOSED:                 { label: "Closed",                  color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  UNRESOLVED:             { label: "Unresolved",              color: "bg-red-100 text-red-700",     dot: "bg-red-500" },
  ESCALATED:              { label: "Escalated",               color: "bg-rose-100 text-rose-700",   dot: "bg-rose-500" },
  REJECTED:               { label: "Rejected",                color: "bg-red-100 text-red-700",     dot: "bg-red-500" },
};

type Complaint = {
  id: string;
  complaintNumber: string;
  title: string;
  productName: string;
  brandName: string;
  category: string;
  subcategory?: string;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
};

const SEVERITY_COLOR: Record<string, string> = {
  Low: "text-slate-500",
  Medium: "text-amber-600",
  High: "text-orange-600",
  Critical: "text-red-600 font-bold",
};

export default function ConsumerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "complaints">("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // If user is an ADMIN, they shouldn't use the consumer dashboard
      if ((session?.user as any)?.role === "ADMIN") {
        router.push("/admin/dashboard");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") fetchComplaints();
  }, [status]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/complaints/my");
      if (!res.ok) { setError("Failed to load your complaints."); return; }
      setComplaints(await res.json());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-700 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  // KPIs
  const total = complaints.length;
  const active = complaints.filter(c => !["CLOSED","RESOLVED","REJECTED"].includes(c.status)).length;
  const underReview = complaints.filter(c => ["SUBMITTED","UNDER_REVIEW","VERIFIED"].includes(c.status)).length;
  const resolved = complaints.filter(c => ["RESOLVED","CLOSED"].includes(c.status)).length;
  const actionRequired = complaints.filter(c => c.status === "MORE_INFO_REQUIRED").length;
  const escalated = complaints.filter(c => c.status === "ESCALATED").length;

  const filtered = complaints.filter(c => {
    const matchSearch = !search || [c.complaintNumber, c.title, c.productName, c.brandName, c.category]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const recentComplaints = [...complaints].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── SIDEBAR ── */}
      <aside className="fixed left-0 top-[81px] w-60 h-[calc(100vh-81px)] bg-white border-r border-slate-200 flex flex-col z-40 flex-shrink-0">
        {/* User info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 font-semibold text-sm truncate">{session?.user?.name || "Consumer"}</p>
              <p className="text-slate-500 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <button onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "overview" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </button>
          <button onClick={() => setActiveTab("complaints")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "complaints" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <FileText className="h-4 w-4" /> My Complaints
            {total > 0 && <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{total}</span>}
          </button>
          <Link href="/submit"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Plus className="h-4 w-4" /> Submit Complaint
          </Link>
          <Link href="/track"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Search className="h-4 w-4" /> Track Complaint
          </Link>

          <div className="pt-2 mt-2 border-t border-slate-100">
            {actionRequired > 0 && (
              <button onClick={() => { setActiveTab("complaints"); setStatusFilter("MORE_INFO_REQUIRED"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors">
                <AlertCircle className="h-4 w-4" />
                Action Required
                <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{actionRequired}</span>
              </button>
            )}
            <Link href="/about" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <HelpCircle className="h-4 w-4" /> Help & Support
            </Link>
          </div>
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="ml-60 flex-1 w-[calc(100%-15rem)] min-h-[calc(100vh-81px)]">

        {/* Top bar */}
        <div className="sticky top-[81px] z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900">{activeTab === "overview" ? "Dashboard Overview" : "My Complaints"}</h1>
            <p className="text-slate-500 text-xs">{active} active · {resolved} resolved</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchComplaints} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className="h-4 w-4 text-slate-500" />
            </button>
            <Link href="/submit" className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Plus className="h-4 w-4" /> New Complaint
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Complaints", value: total, color: "text-slate-900", bg: "bg-white" },
                  { label: "Active", value: active, color: "text-amber-700", bg: "bg-amber-50" },
                  { label: "Under Review", value: underReview, color: "text-blue-700", bg: "bg-blue-50" },
                  { label: "Resolved", value: resolved, color: "text-green-700", bg: "bg-green-50" },
                  { label: "Action Required", value: actionRequired, color: "text-orange-700", bg: actionRequired > 0 ? "bg-orange-50 ring-1 ring-orange-200" : "bg-white" },
                ].map((k, i) => (
                  <div key={i} className={`${k.bg} border border-slate-200 rounded-xl p-4`}>
                    <p className="text-xs text-slate-500 font-medium mb-1">{k.label}</p>
                    <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Required Alert */}
              {actionRequired > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-orange-800 text-sm">Action Required on {actionRequired} Complaint{actionRequired > 1 ? "s" : ""}</p>
                    <p className="text-orange-700 text-xs mt-0.5">The admin team has requested additional information. Please respond to keep your complaint active.</p>
                  </div>
                  <button onClick={() => { setActiveTab("complaints"); setStatusFilter("MORE_INFO_REQUIRED"); }}
                    className="flex-shrink-0 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-colors">
                    View
                  </button>
                </div>
              )}

              {/* Recent Complaints */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Recent Activity</h2>
                  <button onClick={() => setActiveTab("complaints")} className="text-blue-700 text-xs font-semibold hover:underline">View All →</button>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center"><div className="animate-spin h-6 w-6 border-4 border-blue-700 border-t-transparent rounded-full mx-auto" /></div>
                ) : recentComplaints.length === 0 ? (
                  <div className="p-10 text-center">
                    <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No complaints yet.</p>
                    <Link href="/submit" className="inline-flex items-center gap-1.5 mt-3 text-blue-700 text-sm font-semibold hover:underline">
                      <Plus className="h-4 w-4" /> Submit your first complaint
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentComplaints.map(c => {
                      const cfg = STATUS_CONFIG[c.status] || { label: c.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
                      return (
                        <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-blue-700">{c.complaintNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <p className="font-semibold text-slate-900 text-sm truncate">{c.title}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{c.productName} · {c.category}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-slate-400 text-xs">{new Date(c.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                            <Link href={`/track?id=${c.complaintNumber}`} className="text-blue-700 text-xs font-semibold hover:underline mt-1 inline-block">
                              View →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Distribution */}
              {complaints.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h2 className="font-bold text-slate-900 mb-4">Status Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(STATUS_CONFIG).filter(([key]) => complaints.some(c => c.status === key)).map(([key, cfg]) => {
                      const count = complaints.filter(c => c.status === key).length;
                      return (
                        <button key={key} onClick={() => { setActiveTab("complaints"); setStatusFilter(key); }}
                          className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <div className="min-w-0">
                            <p className="text-slate-900 text-xs font-semibold truncate">{cfg.label}</p>
                            <p className="text-slate-500 text-xs">{count} complaint{count !== 1 ? "s" : ""}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── COMPLAINTS TAB ── */}
          {activeTab === "complaints" && (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by ID, product, brand..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500 text-slate-700"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                {(search || statusFilter) && (
                  <button onClick={() => { setSearch(""); setStatusFilter(""); }} className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 hover:bg-slate-50">
                    <XCircle className="h-4 w-4" /> Clear
                  </button>
                )}
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                  <div className="animate-spin h-7 w-7 border-4 border-blue-700 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Loading complaints...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700 mb-1">{search || statusFilter ? "No matching complaints" : "No complaints yet"}</p>
                  <p className="text-slate-500 text-sm mb-4">{search || statusFilter ? "Try adjusting your filters." : "Submit your first complaint to get started."}</p>
                  {!search && !statusFilter && (
                    <Link href="/submit" className="inline-flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
                      <Plus className="h-4 w-4" /> Submit Complaint
                    </Link>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>ID</span>
                    <span>Complaint</span>
                    <span>Category</span>
                    <span>Submitted</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filtered.map(c => {
                      const cfg = STATUS_CONFIG[c.status] || { label: c.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
                      return (
                        <div key={c.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                          {/* Mobile layout */}
                          <div className="md:hidden">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-xs font-bold text-blue-700">{c.complaintNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <p className="font-semibold text-slate-900 text-sm mb-0.5">{c.title}</p>
                            <p className="text-slate-500 text-xs mb-2">{c.productName} · {c.brandName}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                              <Link href={`/track?id=${c.complaintNumber}`} className="text-blue-700 text-xs font-bold hover:underline">View →</Link>
                            </div>
                          </div>
                          {/* Desktop layout */}
                          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center">
                            <span className="font-mono text-xs font-bold text-blue-700 whitespace-nowrap">{c.complaintNumber}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{c.title}</p>
                              <p className="text-slate-500 text-xs">{c.productName} · {c.brandName}</p>
                            </div>
                            <span className="text-xs text-slate-600 whitespace-nowrap">{c.category}</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${cfg.color}`}>{cfg.label}</span>
                            <Link href={`/track?id=${c.complaintNumber}`}
                              className="flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-bold whitespace-nowrap">
                              View <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
