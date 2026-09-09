"use client";

import React, { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  Shield, FileText, Users, Building, AlertCircle,
  Search, LogOut, RefreshCw, CheckCircle, Clock,
  ChevronRight, Filter, X, User as UserIcon, Calendar,
  BarChart2, AlertOctagon, Settings, Package, AlertTriangle,
  Truck, MapPin, Plus
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted", UNDER_REVIEW: "Under Review",
  MORE_INFO_REQUIRED: "More Info Required", VERIFIED: "Verified",
  SENT_TO_BRAND: "Sent to Brand", BRAND_RESPONSE: "Brand Response",
  RESOLUTION_IN_PROGRESS: "Resolution in Progress", RESOLVED: "Resolved",
  CLOSED: "Closed", UNRESOLVED: "Unresolved",
  ESCALATED: "Escalated", ADMIN_REVIEW: "Admin Review",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  MORE_INFO_REQUIRED: "bg-orange-100 text-orange-700",
  VERIFIED: "bg-teal-100 text-teal-700",
  SENT_TO_BRAND: "bg-indigo-100 text-indigo-700",
  BRAND_RESPONSE: "bg-violet-100 text-violet-700",
  RESOLUTION_IN_PROGRESS: "bg-sky-100 text-sky-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
  UNRESOLVED: "bg-red-100 text-red-700",
  ESCALATED: "bg-rose-100 text-rose-700",
  ADMIN_REVIEW: "bg-purple-100 text-purple-700",
};

const SEVERITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

type Complaint = {
  id: string; complaintNumber: string; title: string; status: string;
  severity: string; category: string; brandName: string; createdAt: string;
  consumer: { fullName: string; email: string };
  brand: { name: string } | null;
  _count: { evidences: number; brandResponses: number };
};

type TrackingEvent = {
  id: string; status: string; location: string;
  city: string | null; state: string | null; country: string;
  latitude: number | null; longitude: number | null;
  notes: string | null; timestamp: string; source: string;
};

type ReturnRequest = {
  id: string; returnNumber: string; status: string;
  resolutionType: string; refundAmount: number | null;
  pickupAddress: string | null; notes: string | null;
  createdAt: string; updatedAt: string;
  trackingEvents: TrackingEvent[];
  complaint: {
    complaintNumber: string; productName: string; brandName: string; status: string;
    consumer: { fullName: string; email: string };
  };
};

type Stats = {
  totalComplaints: number; totalConsumers: number; totalBrands: number;
  statusCounts: Record<string, number>;
  recentComplaints: Complaint[];
  complaintsByProduct: { name: string; count: number }[];
  complaintsByBrand: { name: string; count: number }[];
  complaintsByCategory: { name: string; count: number }[];
};

type ConsumerComplaint = {
  id: string; complaintNumber: string; title: string; status: string;
  createdAt: string; updatedAt: string; consumerMobile: string;
  productName: string; brandName: string; category: string;
};

type Consumer = {
  id: string; fullName: string; email: string; mobileNumber: string;
  isActive: boolean; createdAt: string; updatedAt: string;
  totalComplaints: number;
  complaints: ConsumerComplaint[];
};

type Brand = { id: string; name: string };

// ─── ProductsTab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<{
    productName: string; brandName: string; category: string;
    totalComplaints: number; openComplaints: number; resolvedComplaints: number;
    topComplaintTypes: { type: string; count: number }[];
    isHighVolume: boolean;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setIsLoading(false); })
      .catch(() => { setError("Failed to load product data."); setIsLoading(false); });
  }, []);

  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.brandName.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-lg">
            <Package className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Product Intelligence</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:border-blue-500 w-56"
          />
        </div>
      </div>
      <p className="text-slate-500 text-sm">Aggregated from real complaint data. Products with 3+ complaints are flagged for review.</p>

      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-400">Loading product data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700/40 text-red-400 rounded-xl p-4 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{search ? "No products match your search." : "No complaints have been submitted yet. Products will appear here once complaints are filed."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <div key={i} className={`bg-slate-900 border rounded-2xl p-5 ${p.isHighVolume ? "border-rose-700/50" : "border-slate-800"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-sm">{p.productName}</h3>
                    {p.isHighVolume && (
                      <span className="flex items-center gap-1 text-xs bg-rose-900/40 text-rose-400 border border-rose-700/50 px-2 py-0.5 rounded-full font-semibold">
                        <AlertTriangle className="h-3 w-3" /> High Volume
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs">{p.brandName} · <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{p.category}</span></p>
                  {p.topComplaintTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.topComplaintTypes.map(ct => (
                        <span key={ct.type} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {ct.type} ({ct.count})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">{p.totalComplaints}</p>
                    <p className="text-slate-500 text-xs">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-amber-400 font-bold text-lg">{p.openComplaints}</p>
                    <p className="text-slate-500 text-xs">Open</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 font-bold text-lg">{p.resolvedComplaints}</p>
                    <p className="text-slate-500 text-xs">Resolved</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [isLoadingConsumers, setIsLoadingConsumers] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "complaints" | "consumers" | "brands" | "products" | "analytics" | "escalations" | "settings" | "tracking">("overview");
  // Return tracking state
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [showCreateReturn, setShowCreateReturn] = useState(false);
  const [createReturnComplaintId, setCreateReturnComplaintId] = useState("");
  const [createReturnType, setCreateReturnType] = useState("REFUND");
  const [createReturnPickup, setCreateReturnPickup] = useState("");
  const [createReturnAmount, setCreateReturnAmount] = useState("");
  const [createReturnNotes, setCreateReturnNotes] = useState("");
  const [newEventStatus, setNewEventStatus] = useState("IN_TRANSIT");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventCity, setNewEventCity] = useState("");
  const [newEventState, setNewEventState] = useState("");
  const [newEventLat, setNewEventLat] = useState("");
  const [newEventLng, setNewEventLng] = useState("");
  const [newEventNotes, setNewEventNotes] = useState("");
  const [trackingAction, setTrackingAction] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [showCreateConsumer, setShowCreateConsumer] = useState(false);
  const [newConsumer, setNewConsumer] = useState({ legalName: "", displayName: "", email: "", password: "" });
  const [consumerCreateError, setConsumerCreateError] = useState("");
  const [isCreatingConsumer, setIsCreatingConsumer] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [assignBrandId, setAssignBrandId] = useState("");
  const [actionNote, setActionNote] = useState("");

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } finally { setIsLoadingStats(false); }
  }, []);

  const fetchComplaints = useCallback(async () => {
    setIsLoadingComplaints(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/complaints?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } finally { setIsLoadingComplaints(false); }
  }, [page, statusFilter, search]);

  const fetchBrands = useCallback(async () => {
    const res = await fetch("/api/admin/brands");
    if (res.ok) setBrands(await res.json());
  }, []);

  const fetchConsumers = useCallback(async () => {
    setIsLoadingConsumers(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/consumers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setConsumers(data.consumers);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } finally { setIsLoadingConsumers(false); }
  }, [page, search]);

  const fetchReturns = useCallback(async () => {
    setIsLoadingReturns(true);
    try {
      const res = await fetch("/api/admin/tracking");
      if (res.ok) { const d = await res.json(); setReturns(d.returns || []); }
    } finally { setIsLoadingReturns(false); }
  }, []);

  const handleCreateConsumer = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreatingConsumer(true);
    setConsumerCreateError("");
    try {
      const response = await fetch("/api/admin/consumers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConsumer),
      });
      const result = await response.json();
      if (!response.ok) {
        setConsumerCreateError(result.error || "Failed to create consumer.");
        return;
      }
      setNewConsumer({ legalName: "", displayName: "", email: "", password: "" });
      setShowCreateConsumer(false);
      fetchConsumers();
      fetchStats();
    } catch {
      setConsumerCreateError("Network error. Please try again.");
    } finally {
      setIsCreatingConsumer(false);
    }
  };

  useEffect(() => { fetchStats(); fetchBrands(); }, [fetchStats, fetchBrands]);
  useEffect(() => {
    if (activeTab === "complaints") fetchComplaints();
    else if (activeTab === "consumers") fetchConsumers();
    else if (activeTab === "tracking") fetchReturns();
  }, [activeTab, fetchComplaints, fetchConsumers, fetchReturns]);

  const handleCreateReturn = async () => {
    if (!createReturnComplaintId || !createReturnType) return;
    setTrackingAction(true);
    try {
      const res = await fetch("/api/admin/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_RETURN",
          complaintId: createReturnComplaintId,
          resolutionType: createReturnType,
          pickupAddress: createReturnPickup,
          refundAmount: createReturnAmount || null,
          notes: createReturnNotes,
        }),
      });
      if (res.ok) {
        setShowCreateReturn(false);
        setCreateReturnComplaintId(""); setCreateReturnPickup("");
        setCreateReturnAmount(""); setCreateReturnNotes("");
        fetchReturns();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create return.");
      }
    } finally { setTrackingAction(false); }
  };

  const handleAddEvent = async () => {
    if (!selectedReturn || !newEventStatus || !newEventLocation) return;
    setTrackingAction(true);
    try {
      const res = await fetch("/api/admin/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_EVENT",
          returnRequestId: selectedReturn.id,
          status: newEventStatus,
          location: newEventLocation,
          city: newEventCity,
          state: newEventState,
          latitude: newEventLat || null,
          longitude: newEventLng || null,
          notes: newEventNotes,
        }),
      });
      if (res.ok) {
        setNewEventLocation(""); setNewEventCity(""); setNewEventState("");
        setNewEventLat(""); setNewEventLng(""); setNewEventNotes("");
        fetchReturns();
        setSelectedReturn(null);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to add event.");
      }
    } finally { setTrackingAction(false); }
  };

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !newStatus) return;
    setUpdatingId(selectedComplaint.id);
    try {
      const res = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: selectedComplaint.id, action: "UPDATE_STATUS", status: newStatus, note: actionNote }),
      });
      if (res.ok) { setSelectedComplaint(null); setNewStatus(""); setActionNote(""); fetchComplaints(); fetchStats(); }
    } finally { setUpdatingId(null); }
  };

  const handleAssignBrand = async () => {
    if (!selectedComplaint || !assignBrandId) return;
    setUpdatingId(selectedComplaint.id);
    try {
      const res = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: selectedComplaint.id, action: "ASSIGN_BRAND", brandId: assignBrandId, note: actionNote }),
      });
      if (res.ok) { setSelectedComplaint(null); setAssignBrandId(""); setActionNote(""); fetchComplaints(); fetchStats(); }
    } finally { setUpdatingId(null); }
  };

  const statCards = stats ? [
    { label: "Total Complaints",   value: stats.totalComplaints,                          icon: FileText,    color: "text-blue-400",   bg: "bg-blue-900/30 border border-blue-700/30" },
    { label: "New / Submitted",    value: stats.statusCounts["SUBMITTED"] || 0,           icon: Clock,       color: "text-cyan-400",   bg: "bg-cyan-900/30 border border-cyan-700/30" },
    { label: "Under Review",       value: stats.statusCounts["UNDER_REVIEW"] || 0,        icon: Search,      color: "text-amber-400",  bg: "bg-amber-900/30 border border-amber-700/30" },
    { label: "Assigned to Brand",  value: stats.statusCounts["SENT_TO_BRAND"] || 0,      icon: Building,    color: "text-indigo-400", bg: "bg-indigo-900/30 border border-indigo-700/30" },
    { label: "Escalated",          value: stats.statusCounts["ESCALATED"] || 0,           icon: AlertCircle, color: "text-rose-400",   bg: "bg-rose-900/30 border border-rose-700/30" },
    { label: "Resolved",           value: stats.statusCounts["RESOLVED"] || 0,            icon: CheckCircle, color: "text-green-400",  bg: "bg-green-900/30 border border-green-700/30" },
    { label: "Consumers",          value: stats.totalConsumers,                           icon: Users,       color: "text-sky-400",    bg: "bg-sky-900/30 border border-sky-700/30" },
    { label: "Registered Brands",  value: stats.totalBrands,                             icon: Building,    color: "text-teal-400",   bg: "bg-teal-900/30 border border-teal-700/30" },
  ] : [];

  return (
    <div className="min-h-[calc(100vh-81px)] bg-slate-950 text-slate-100 flex">
      {/* Sidebar - Fixed below the 81px header */}
      <div className="fixed left-0 top-[81px] h-[calc(100vh-81px)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 border border-blue-500/30 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Admin Panel</p>
              <p className="text-white font-bold text-sm">TrustPortal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: "overview", label: "Overview", icon: CheckCircle },
            { id: "complaints", label: "All Complaints", icon: FileText },
            { id: "consumers", label: "Consumers", icon: UserIcon },
            { id: "brands", label: "Brands", icon: Building },
            { id: "products", label: "Products", icon: Package },
            { id: "analytics", label: "Analytics", icon: BarChart2 },
            { id: "tracking", label: "Return Tracking", icon: Truck },
            { id: "escalations", label: "Escalations", icon: AlertOctagon },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setPage(1); setSearch(""); setSearchInput(""); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all text-left ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <LogOut className="h-4 w-4 text-slate-500" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 w-[calc(100%-16rem)] p-8 min-h-[calc(100vh-81px)]">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === "overview" ? "Dashboard Overview" : activeTab === "complaints" ? "Complaints Management" : "Consumers Management"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "overview" ? "Real-time portal statistics" : `${total} total ${activeTab}`}
            </p>
          </div>
          <button onClick={() => { fetchStats(); if (activeTab === "complaints") fetchComplaints(); else if (activeTab === "consumers") fetchConsumers(); }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards — 4 per row on large screens */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {isLoadingStats ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
                    <div className="h-8 w-8 bg-slate-800 rounded-lg mb-3"></div>
                    <div className="h-6 w-12 bg-slate-800 rounded mb-1"></div>
                    <div className="h-3 w-20 bg-slate-800 rounded"></div>
                  </div>
                ))
              ) : statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`${card.bg} rounded-2xl p-5 flex flex-col`}>
                    <Icon className={`h-5 w-5 ${card.color} mb-3`} />
                    <p className="text-2xl font-extrabold text-white mb-0.5">{card.value}</p>
                    <p className="text-slate-400 text-xs font-medium">{card.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Attention Required Panel */}
            {stats && (stats.statusCounts["ESCALATED"] || 0) + (stats.statusCounts["MORE_INFO_REQUIRED"] || 0) + (stats.statusCounts["SUBMITTED"] || 0) > 0 && (
              <div className="bg-slate-900 border border-rose-700/40 rounded-2xl p-5">
                <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  Attention Required
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(stats.statusCounts["ESCALATED"] || 0) > 0 && (
                    <button onClick={() => { setStatusFilter("ESCALATED"); setActiveTab("complaints"); }}
                      className="flex items-center justify-between p-4 bg-rose-900/30 border border-rose-700/40 rounded-xl hover:bg-rose-900/50 transition-colors">
                      <div className="text-left">
                        <p className="text-rose-300 font-bold text-sm">Escalated Complaints</p>
                        <p className="text-rose-400/70 text-xs mt-0.5">Require immediate attention</p>
                      </div>
                      <span className="text-2xl font-extrabold text-rose-300">{stats.statusCounts["ESCALATED"]}</span>
                    </button>
                  )}
                  {(stats.statusCounts["MORE_INFO_REQUIRED"] || 0) > 0 && (
                    <button onClick={() => { setStatusFilter("MORE_INFO_REQUIRED"); setActiveTab("complaints"); }}
                      className="flex items-center justify-between p-4 bg-orange-900/30 border border-orange-700/40 rounded-xl hover:bg-orange-900/50 transition-colors">
                      <div className="text-left">
                        <p className="text-orange-300 font-bold text-sm">Awaiting Consumer Info</p>
                        <p className="text-orange-400/70 text-xs mt-0.5">Consumer hasn't responded</p>
                      </div>
                      <span className="text-2xl font-extrabold text-orange-300">{stats.statusCounts["MORE_INFO_REQUIRED"]}</span>
                    </button>
                  )}
                  {(stats.statusCounts["SUBMITTED"] || 0) > 0 && (
                    <button onClick={() => { setStatusFilter("SUBMITTED"); setActiveTab("complaints"); }}
                      className="flex items-center justify-between p-4 bg-blue-900/30 border border-blue-700/40 rounded-xl hover:bg-blue-900/50 transition-colors">
                      <div className="text-left">
                        <p className="text-blue-300 font-bold text-sm">Pending Verification</p>
                        <p className="text-blue-400/70 text-xs mt-0.5">Newly submitted, not yet reviewed</p>
                      </div>
                      <span className="text-2xl font-extrabold text-blue-300">{stats.statusCounts["SUBMITTED"]}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Status Breakdown */}
            {stats && Object.keys(stats.statusCounts).length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-6">Complaints by Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setActiveTab("complaints"); }}
                      className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors group"
                    >
                      <span className="text-slate-300 text-xs font-medium group-hover:text-white">{STATUS_LABELS[status] || status}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || "bg-slate-700 text-slate-300"}`}>{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Complaints */}
            {stats && stats.recentComplaints.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
                  <h3 className="text-white font-bold text-lg">Recent Complaints</h3>
                  <button onClick={() => setActiveTab("complaints")} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="divide-y divide-slate-800">
                  {stats.recentComplaints.map((c) => (
                    <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-blue-400 font-mono text-xs font-bold">{c.complaintNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] || "bg-slate-700 text-slate-300"}`}>{STATUS_LABELS[c.status] || c.status}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[c.severity] || "bg-slate-700 text-slate-300"}`}>{c.severity}</span>
                        </div>
                        <p className="text-white text-sm font-medium truncate">{c.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{c.consumer.fullName} · {c.brandName}</p>
                      </div>
                      <p className="text-slate-500 text-xs ml-4 flex-shrink-0">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats && stats.recentComplaints.length === 0 && !isLoadingStats && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No complaints submitted yet.</p>
                <p className="text-slate-500 text-sm mt-1">Once consumers submit complaints, they will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === "complaints" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                  placeholder="Search by ID, title, brand, consumer..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              {(statusFilter || search) && (
                <button onClick={() => { setStatusFilter(""); setSearch(""); setSearchInput(""); setPage(1); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm hover:bg-slate-700 transition-colors">
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
              <button onClick={() => { setSearch(searchInput); setPage(1); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-semibold transition-colors">
                <Filter className="h-4 w-4" /> Apply
              </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {isLoadingComplaints ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 mt-4 text-sm">Loading complaints...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No complaints found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {["Complaint ID", "Consumer", "Title", "Brand", "Status", "Severity", "Date", "Actions"].map((h) => (
                          <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {complaints.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-blue-400 font-mono text-xs font-bold">{c.complaintNumber}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-white font-medium text-xs">{c.consumer.fullName}</p>
                            <p className="text-slate-500 text-xs">{c.consumer.email}</p>
                          </td>
                          <td className="px-5 py-4 max-w-[200px]">
                            <p className="text-slate-200 truncate text-xs">{c.title}</p>
                            <p className="text-slate-500 text-xs">{c.category}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-slate-300 text-xs">{c.brand?.name || c.brandName}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status] || "bg-slate-700 text-slate-300"}`}>
                              {STATUS_LABELS[c.status] || c.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${SEVERITY_COLORS[c.severity] || "bg-slate-700 text-slate-300"}`}>
                              {c.severity}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); setAssignBrandId(""); setActionNote(""); }}
                              className="text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">Next →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONSUMERS TAB */}
        {activeTab === "consumers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-lg">
                  <UserIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{total} Total Consumers</h2>
              </div>
              <button onClick={() => { setShowCreateConsumer(true); setConsumerCreateError(""); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-semibold transition-colors">
                <Plus className="h-4 w-4" /> Add Consumer
              </button>
            </div>

            {showCreateConsumer && (
              <form onSubmit={handleCreateConsumer} className="bg-slate-900 border border-blue-700/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">Create Consumer Account</h3>
                  <button type="button" onClick={() => setShowCreateConsumer(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                {consumerCreateError && <p className="bg-red-900/30 border border-red-700/40 text-red-300 rounded-lg px-4 py-3 text-sm">{consumerCreateError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required value={newConsumer.legalName} onChange={e => setNewConsumer({ ...newConsumer, legalName: e.target.value })} placeholder="Full / Legal Name" className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                  <input value={newConsumer.displayName} onChange={e => setNewConsumer({ ...newConsumer, displayName: e.target.value })} placeholder="Display Name (optional)" className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                  <input required type="email" value={newConsumer.email} onChange={e => setNewConsumer({ ...newConsumer, email: e.target.value })} placeholder="Consumer Email" className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                  <input required minLength={8} type="password" value={newConsumer.password} onChange={e => setNewConsumer({ ...newConsumer, password: e.target.value })} placeholder="Password (min 8 characters)" className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                </div>
                <button type="submit" disabled={isCreatingConsumer} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-xl text-white text-sm font-semibold">
                  {isCreatingConsumer ? "Creating..." : "Create Verified Consumer"}
                </button>
              </form>
            )}

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                  placeholder="Search by name, email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>
              {search && (
                <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm hover:bg-slate-700 transition-colors">
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
              <button onClick={() => { setSearch(searchInput); setPage(1); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-semibold transition-colors">
                <Filter className="h-4 w-4" /> Search
              </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {isLoadingConsumers ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 mt-4 text-sm">Loading consumers...</p>
                </div>
              ) : consumers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No consumers found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {["Consumer ID", "Full Name", "Email", "Mobile Number", "Registration Date", "Status", "Complaints", "Actions"].map((h) => (
                          <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {consumers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-blue-400 font-mono text-xs font-bold">{user.id.substring(0, 8)}...</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-white font-medium text-sm">{user.fullName}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-slate-300 text-sm">{user.email}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-slate-400 text-xs">{user.mobileNumber}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-lg">{user.totalComplaints}</span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => setSelectedConsumer(user)}
                              className="text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium whitespace-nowrap"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">Next →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && stats && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600/20 border border-purple-500/30 p-2 rounded-lg">
                <BarChart2 className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Complaint Intelligence & Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaints by Category */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Complaints by Category</h3>
                <div className="space-y-4">
                  {stats.complaintsByCategory.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="text-white font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.max(2, (item.count / stats.totalComplaints) * 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Current Status Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats.statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[status] || "bg-slate-600 text-slate-300"}`}>
                        {STATUS_LABELS[status] || status}
                      </span>
                      <span className="text-white font-bold text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repeat Complaints by Product */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                <h3 className="text-white font-bold text-lg mb-4">Product-Level Tracking (Top Products)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.complaintsByProduct.map((item) => (
                    <div key={item.name} className={`p-4 rounded-xl border ${item.count >= 5 ? 'bg-red-500/10 border-red-500/30' : item.count >= 3 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-200 font-medium text-sm line-clamp-2 pr-2">{item.name}</p>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.count >= 5 ? 'bg-red-500 text-white' : item.count >= 3 ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                          {item.count}
                        </span>
                      </div>
                      {item.count >= 5 && <p className="text-red-400 text-xs font-semibold mt-2">Critical Volume Alert</p>}
                    </div>
                  ))}
                  {stats.complaintsByProduct.length === 0 && (
                    <p className="text-slate-500 text-sm col-span-3">No product data available yet.</p>
                  )}
                </div>
              </div>

              {/* Repeat Complaints by Brand */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                <h3 className="text-white font-bold text-lg mb-4">Brand Intelligence (Top Brands)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {stats.complaintsByBrand.map((item) => (
                    <div key={item.name} className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-center">
                      <p className="text-slate-300 font-medium text-sm mb-2 truncate" title={item.name}>{item.name}</p>
                      <p className="text-3xl font-bold text-white">{item.count}</p>
                      <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">Complaints</p>
                    </div>
                  ))}
                  {stats.complaintsByBrand.length === 0 && (
                    <p className="text-slate-500 text-sm col-span-4 text-left">No brand data available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <ProductsTab />
        )}

        {/* RETURN TRACKING TAB */}
        {activeTab === "tracking" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 border border-blue-500/30 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Return & Refund Tracking</h2>
                  <p className="text-slate-400 text-sm">{returns.length} return request(s)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={fetchReturns} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition-colors">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </button>
                <button onClick={() => setShowCreateReturn(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors">
                  <Plus className="h-4 w-4" /> Create Return
                </button>
              </div>
            </div>

            {isLoadingReturns ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-slate-400 mt-4 text-sm">Loading return requests...</p>
              </div>
            ) : returns.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                <Truck className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No return requests found.</p>
                <p className="text-slate-500 text-sm mt-1">Click &quot;Create Return&quot; to start a return/refund for a complaint.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {returns.map((ret) => {
                  const lastEvent = ret.trackingEvents[ret.trackingEvents.length - 1];
                  return (
                    <div key={ret.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-blue-400 font-mono text-sm font-bold">{ret.returnNumber}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold uppercase">{ret.status.replace(/_/g, " ")}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ret.resolutionType === "REFUND" ? "bg-green-900/40 text-green-400" : "bg-indigo-900/40 text-indigo-400"}`}>{ret.resolutionType}</span>
                          </div>
                          <p className="text-slate-300 text-sm">Complaint: <span className="text-blue-400 font-mono">{ret.complaint.complaintNumber}</span> — {ret.complaint.productName}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{ret.complaint.consumer.fullName} · {ret.complaint.consumer.email}</p>
                        </div>
                        <button
                          onClick={() => { setSelectedReturn(ret); setNewEventStatus("IN_TRANSIT"); setNewEventLocation(""); }}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" /> Add Event
                        </button>
                      </div>

                      {lastEvent && (
                        <div className="bg-slate-800/60 rounded-xl p-3 text-xs mb-3">
                          <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Last Verified Location</p>
                          <p className="text-white font-medium">{lastEvent.location}{lastEvent.city ? `, ${lastEvent.city}` : ""}{lastEvent.state ? `, ${lastEvent.state}` : ""}</p>
                          <p className="text-slate-500 mt-0.5">{new Date(lastEvent.timestamp).toLocaleString("en-IN")}</p>
                        </div>
                      )}

                      {ret.trackingEvents.length > 0 && (
                        <div className="relative border-l-2 border-slate-700 ml-2 space-y-3 mt-2">
                          {ret.trackingEvents.map((evt, i) => (
                            <div key={evt.id} className="relative pl-5">
                              <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border border-slate-700 ${i === ret.trackingEvents.length - 1 ? "bg-blue-500" : "bg-slate-500"}`} />
                              <p className="text-xs font-bold text-slate-300 uppercase">{evt.status.replace(/_/g, " ")}</p>
                              <p className="text-slate-400 text-xs">{evt.location}{evt.city ? `, ${evt.city}` : ""}</p>
                              {evt.latitude && <p className="text-slate-600 text-xs">📍 {evt.latitude}, {evt.longitude}</p>}
                              <p className="text-slate-600 text-xs">{new Date(evt.timestamp).toLocaleString("en-IN")}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ESCALATIONS TAB */}
        {activeTab === "escalations" && stats && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-600/20 border border-rose-500/30 p-2 rounded-lg">
                <AlertOctagon className="h-5 w-5 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Escalated Complaints</h2>
            </div>
            {(stats.statusCounts["ESCALATED"] || 0) === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <AlertOctagon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No escalated complaints at this time.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-rose-800/40 rounded-2xl p-6">
                <p className="text-rose-400 font-semibold mb-2">{stats.statusCounts["ESCALATED"]} escalated complaint(s) require attention.</p>
                <p className="text-slate-400 text-sm">Use the All Complaints tab, filter by &quot;Escalated&quot; to view and action them.</p>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-700/50 border border-slate-600/30 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-white">System Settings</h2>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-bold text-lg mb-2">Database & System Information</h3>
              {[
                { label: "Database", value: "SQLite (dev.db)" },
                { label: "ORM", value: "Prisma v6" },
                { label: "Database Location", value: "prisma/dev.db" },
                { label: "Schema File", value: "prisma/schema.prisma" },
                { label: "User Model", value: "User (role: CONSUMER | ADMIN)" },
                { label: "Complaint Model", value: "Complaint" },
                { label: "Status History", value: "StatusHistory" },
                { label: "Notification Model", value: "Notification" },
                { label: "Verification Model", value: "VerificationCode" },
                { label: "Auth System", value: "NextAuth.js v5 (JWT Sessions)" },
                { label: "Auth Strategy", value: "Credentials (email/password + bcrypt)" },
                { label: "OTP Storage", value: "Hashed (bcrypt) in VerificationCode table" },
                { label: "Email Service", value: process.env.SMTP_HOST ? `SMTP: ${process.env.SMTP_HOST}` : "Not configured (check .env SMTP_HOST)" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-white text-sm font-mono bg-slate-800 px-2 py-0.5 rounded">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5">
              <p className="text-amber-400 text-sm font-semibold mb-1">Email Configuration Required</p>
              <p className="text-amber-300/70 text-xs">Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in your .env file to enable real email delivery for OTP, complaint acknowledgements, and status updates.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Return Modal */}
      {showCreateReturn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-blue-400" /> Create Return Request</h3>
              <button onClick={() => setShowCreateReturn(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Complaint ID (internal DB id)</label>
                <input value={createReturnComplaintId} onChange={e => setCreateReturnComplaintId(e.target.value)} placeholder="Paste complaint DB id..." className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Resolution Type</label>
                <select value={createReturnType} onChange={e => setCreateReturnType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500">
                  <option value="REFUND">Refund</option>
                  <option value="REPLACEMENT">Replacement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pickup Address (optional)</label>
                <input value={createReturnPickup} onChange={e => setCreateReturnPickup(e.target.value)} placeholder="Consumer pickup address..." className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Refund Amount ₹ (optional)</label>
                <input type="number" value={createReturnAmount} onChange={e => setCreateReturnAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes (optional)</label>
                <textarea value={createReturnNotes} onChange={e => setCreateReturnNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500 resize-none" />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setShowCreateReturn(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleCreateReturn} disabled={trackingAction || !createReturnComplaintId} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                {trackingAction ? <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "Create Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tracking Event Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div>
                <p className="text-blue-400 font-mono text-sm font-bold">{selectedReturn.returnNumber}</p>
                <h3 className="text-white font-bold text-lg mt-0.5">Add Tracking Event</h3>
              </div>
              <button onClick={() => setSelectedReturn(null)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select value={newEventStatus} onChange={e => setNewEventStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500">
                  {["RETURN_REQUESTED","PICKUP_SCHEDULED","PICKED_UP","IN_TRANSIT","RECEIVED","INSPECTION","REFUND_INITIATED","REFUND_COMPLETED","REPLACEMENT_INITIATED","REPLACEMENT_DELIVERED","CLOSED"].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location (shown to consumer) *</label>
                <input value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} placeholder="e.g. Brand service centre, Pune" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">City</label>
                  <input value={newEventCity} onChange={e => setNewEventCity(e.target.value)} placeholder="Pune" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">State</label>
                  <input value={newEventState} onChange={e => setNewEventState(e.target.value)} placeholder="Maharashtra" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Latitude (optional)</label>
                  <input type="number" step="any" value={newEventLat} onChange={e => setNewEventLat(e.target.value)} placeholder="18.5204" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Longitude (optional)</label>
                  <input type="number" step="any" value={newEventLng} onChange={e => setNewEventLng(e.target.value)} placeholder="73.8567" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes (optional)</label>
                <textarea value={newEventNotes} onChange={e => setNewEventNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500 resize-none" />
              </div>
              <p className="text-xs text-slate-500">* Location label is shown to the consumer as &quot;Last Verified Location&quot;. Lat/Lng will pin the event on the map.</p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setSelectedReturn(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleAddEvent} disabled={trackingAction || !newEventLocation} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                {trackingAction ? <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div>
                <p className="text-blue-400 font-mono text-sm font-bold">{selectedComplaint.complaintNumber}</p>
                <h3 className="text-white font-bold text-lg mt-0.5">{selectedComplaint.title}</h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Update Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500"
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Assign Brand */}
              {brands.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign to Brand</label>
                  <select
                    value={assignBrandId}
                    onChange={(e) => setAssignBrandId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">— Select Brand —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Internal Note (optional)</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={2}
                  placeholder="Add a note to the status timeline..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm outline-none focus:border-blue-500 resize-none placeholder-slate-500"
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={!!updatingId || !newStatus}
                className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {updatingId ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <><Clock className="h-4 w-4" /> Update Status</>}
              </button>
              {assignBrandId && (
                <button
                  onClick={handleAssignBrand}
                  disabled={!!updatingId}
                  className="flex-1 flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  {updatingId ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <><Building className="h-4 w-4" /> Assign Brand</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Consumer Details Modal */}
      {selectedConsumer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{selectedConsumer.fullName}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{selectedConsumer.email} • ID: <span className="font-mono text-xs">{selectedConsumer.id}</span></p>
                </div>
              </div>
              <button onClick={() => setSelectedConsumer(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Account Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedConsumer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {selectedConsumer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Registration</p>
                  <p className="text-white font-medium text-sm flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(selectedConsumer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Mobile Number</p>
                  <p className="text-white font-medium text-sm">{selectedConsumer.mobileNumber}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Complaints</p>
                  <p className="text-white font-medium text-lg">{selectedConsumer.totalComplaints}</p>
                </div>
              </div>

              {/* Complaints List */}
              <div>
                <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Consumer's Complaints History
                </h4>
                
                {selectedConsumer.complaints && selectedConsumer.complaints.length > 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-700">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">ID</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Product & Brand</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Category</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Submitted Date</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {selectedConsumer.complaints.map((comp) => (
                          <tr key={comp.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-blue-400 font-mono text-xs font-bold">{comp.complaintNumber}</span>
                            </td>
                            <td className="px-4 py-3 min-w-[200px]">
                              <p className="text-slate-200 text-sm font-medium">{comp.productName || comp.title}</p>
                              <p className="text-slate-400 text-xs mt-0.5">{comp.brandName}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-slate-300 text-xs bg-slate-700/50 px-2 py-1 rounded-md">{comp.category}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[comp.status] || "bg-slate-600 text-slate-300"}`}>
                                {STATUS_LABELS[comp.status] || comp.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                              {new Date(comp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                              {comp.updatedAt ? new Date(comp.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
                    <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">This consumer has not submitted any complaints yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex-shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedConsumer(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
