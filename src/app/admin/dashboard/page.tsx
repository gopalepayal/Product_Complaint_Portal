"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Flag,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import React from "react";

type Product = {
  id: string;
  name?: string | null;
  productName?: string | null;
  brandName?: string | null;
  brand?: {
    id?: string;
    name?: string | null;
  } | null;
  category?: string | null;
  type?: string | null;
  modelName?: string | null;
  modelNumber?: string | null;
  complaintCount?: number;
  _count?: {
    complaints?: number;
  };
};

type Complaint = {
  id: string;
  complaintNumber?: string | null;
  title?: string | null;
  status?: string | null;
  severity?: string | null;
  issueCategory?: string | null;
  createdAt?: string | null;
  brandName?: string | null;
  productName?: string | null;
  brand?: {
    name?: string | null;
  } | null;
  product?: {
    name?: string | null;
    brand?: {
      name?: string | null;
    } | null;
  } | null;
  description?: string | null;
  contactEmail?: string | null;
};

type User = {
  id: string;
  legalName?: string | null;
  displayName?: string | null;
  email?: string | null;
  role?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string | null;
};

type Brand = {
  id: string;
  name?: string | null;
  category?: string | null;
  officialWebsite?: string | null;
  verificationStatus?: string | null;
};

type Stats = {
  complaints?: number;
  totalComplaints?: number;
  products?: number;
  totalProducts?: number;
  users?: number;
  totalUsers?: number;
  brands?: number;
  totalBrands?: number;
  published?: number;
  resolved?: number;
  pending?: number;
  pendingReview?: number;
};

type Tab =
  | "overview"
  | "complaints"
  | "products"
  | "users"
  | "brands"
  | "reports";

function safeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getProductName(product: Product): string {
  return (
    safeText(product.name) ||
    safeText(product.productName) ||
    "Unnamed Product"
  );
}

function getBrandName(product: Product): string {
  return (
    safeText(product.brandName) ||
    safeText(product.brand?.name) ||
    "Unknown Brand"
  );
}

function getComplaintProductName(complaint: Complaint): string {
  return (
    safeText(complaint.productName) ||
    safeText(complaint.product?.name) ||
    "Unknown Product"
  );
}

function getComplaintBrandName(complaint: Complaint): string {
  return (
    safeText(complaint.brandName) ||
    safeText(complaint.brand?.name) ||
    safeText(complaint.product?.brand?.name) ||
    "Unknown Brand"
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(value?: string | null): string {
  const status = safeText(value);

  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(value?: string | null): string {
  switch (value) {
    case "PUBLISHED":
    case "ACKNOWLEDGED":
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "RESOLVED":
    case "CLOSED":
      return "bg-green-50 text-green-700 border-green-200";

    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";

    case "DISPUTED":
      return "bg-orange-50 text-orange-700 border-orange-200";

    default:
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }
}

function severityClass(value?: string | null): string {
  switch (value) {
    case "CRITICAL":
      return "bg-red-100 text-red-800";

    case "HIGH":
      return "bg-orange-100 text-orange-800";

    case "LOW":
      return "bg-green-100 text-green-800";

    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const [stats, setStats] = useState<Stats>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const [complaintStatus, setComplaintStatus] = useState("ALL");

  async function fetchJson(url: string) {
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        fetchJson("/api/admin/stats"),
        fetchJson("/api/admin/products"),
        fetchJson("/api/admin/complaints"),
        fetchJson("/api/admin/consumers"),
        fetchJson("/api/admin/brands"),
      ]);

      const statsResult = results[0];
      const productsResult = results[1];
      const complaintsResult = results[2];
      const usersResult = results[3];
      const brandsResult = results[4];

      if (statsResult.status === "fulfilled") {
        const data = statsResult.value;

        setStats(
          data?.stats ??
            data?.data ??
            data ??
            {}
        );
      }

      if (productsResult.status === "fulfilled") {
        const data = productsResult.value;

        const productData =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.products)
              ? data.products
              : Array.isArray(data?.data)
                ? data.data
                : [];

        setProducts(productData);
      }

      if (complaintsResult.status === "fulfilled") {
        const data = complaintsResult.value;

        const complaintData =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.complaints)
              ? data.complaints
              : Array.isArray(data?.data)
                ? data.data
                : [];

        setComplaints(complaintData);
      }

      if (usersResult.status === "fulfilled") {
        const data = usersResult.value;

        const userData =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.users)
              ? data.users
              : Array.isArray(data?.consumers)
                ? data.consumers
                : Array.isArray(data?.data)
                  ? data.data
                  : [];

        setUsers(userData);
      }

      if (brandsResult.status === "fulfilled") {
        const data = brandsResult.value;

        const brandData =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.brands)
              ? data.brands
              : Array.isArray(data?.data)
                ? data.data
                : [];

        setBrands(brandData);
      }

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === results.length) {
        setError("Unable to load admin dashboard data.");
      }
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError("Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function submitComplaint(complaintId: string) {
    try {
      setIsSubmitting(complaintId);
      const response = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          action: "UPDATE_STATUS",
          status: "SUBMITTED",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit complaint");
      }
      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: "SUBMITTED" } : c))
      );
      setExpandedComplaintId(null);
      alert("Complaint submitted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(null);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalComplaints =
    stats.totalComplaints ??
    stats.complaints ??
    complaints.length;

  const totalProducts =
    stats.totalProducts ??
    stats.products ??
    products.length;

  const totalUsers =
    stats.totalUsers ??
    stats.users ??
    users.length;

  const totalBrands =
    stats.totalBrands ??
    stats.brands ??
    brands.length;

  const pendingComplaints =
    stats.pendingReview ??
    stats.pending ??
    complaints.filter(
      (complaint) =>
        complaint.status === "PENDING_REVIEW" ||
        complaint.status === "SUBMITTED"
    ).length;

  const publishedComplaints =
    stats.published ??
    complaints.filter(
      (complaint) => complaint.status === "PUBLISHED"
    ).length;

  const resolvedComplaints =
    stats.resolved ??
    complaints.filter(
      (complaint) =>
        complaint.status === "RESOLVED" ||
        complaint.status === "CLOSED"
    ).length;

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      const productName = getProductName(product).toLowerCase();
      const brandName = getBrandName(product).toLowerCase();
      const category = safeText(product.category).toLowerCase();
      const type = safeText(product.type).toLowerCase();
      const modelName = safeText(product.modelName).toLowerCase();
      const modelNumber = safeText(product.modelNumber).toLowerCase();

      return (
        productName.includes(search) ||
        brandName.includes(search) ||
        category.includes(search) ||
        type.includes(search) ||
        modelName.includes(search) ||
        modelNumber.includes(search)
      );
    });
  }, [products, productSearch]);

  const filteredComplaints = useMemo(() => {
    const search = complaintSearch.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesStatus =
        complaintStatus === "ALL" ||
        complaint.status === complaintStatus;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const title = safeText(complaint.title).toLowerCase();
      const number = safeText(complaint.complaintNumber).toLowerCase();
      const product = getComplaintProductName(complaint).toLowerCase();
      const brand = getComplaintBrandName(complaint).toLowerCase();

      return (
        title.includes(search) ||
        number.includes(search) ||
        product.includes(search) ||
        brand.includes(search)
      );
    });
  }, [complaints, complaintSearch, complaintStatus]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const legalName = safeText(user.legalName).toLowerCase();
      const displayName = safeText(user.displayName).toLowerCase();
      const email = safeText(user.email).toLowerCase();
      const role = safeText(user.role).toLowerCase();

      return (
        legalName.includes(search) ||
        displayName.includes(search) ||
        email.includes(search) ||
        role.includes(search)
      );
    });
  }, [users, userSearch]);

  const filteredBrands = useMemo(() => {
    const search = brandSearch.trim().toLowerCase();

    if (!search) {
      return brands;
    }

    return brands.filter((brand) => {
      const name = safeText(brand.name).toLowerCase();
      const category = safeText(brand.category).toLowerCase();
      const website = safeText(brand.officialWebsite).toLowerCase();

      return (
        name.includes(search) ||
        category.includes(search) ||
        website.includes(search)
      );
    });
  }, [brands, brandSearch]);

  const recentComplaints = [...complaints]
    .sort((a, b) => {
      const first = new Date(a.createdAt || 0).getTime();
      const second = new Date(b.createdAt || 0).getTime();

      return second - first;
    })
    .slice(0, 8);

  const tabs: Array<{
    id: Tab;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 size={18} />,
    },
    {
      id: "complaints",
      label: "Complaints",
      icon: <FileText size={18} />,
    },
    {
      id: "products",
      label: "Products",
      icon: <Package size={18} />,
    },
    {
      id: "users",
      label: "Consumers",
      icon: <Users size={18} />,
    },
    {
      id: "brands",
      label: "Brands",
      icon: <ShieldCheck size={18} />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <Flag size={18} />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-gray-500"
              />
              <p className="mt-4 text-gray-600">
                Loading admin dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage complaints, products, consumers, brands and reports.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Complaints"
                value={totalComplaints}
                description="All complaints"
                icon={<FileText size={22} />}
              />

              <StatCard
                title="Pending Review"
                value={pendingComplaints}
                description="Waiting for moderation"
                icon={<Clock3 size={22} />}
              />

              <StatCard
                title="Resolved"
                value={resolvedComplaints}
                description="Resolved or closed"
                icon={<CheckCircle2 size={22} />}
              />

              <StatCard
                title="Products"
                value={totalProducts}
                description="Registered products"
                icon={<Package size={22} />}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Consumers"
                value={totalUsers}
                description="Registered users"
                icon={<Users size={22} />}
              />

              <StatCard
                title="Brands"
                value={totalBrands}
                description="Registered brands"
                icon={<ShieldCheck size={22} />}
              />

              <StatCard
                title="Published"
                value={publishedComplaints}
                description="Public complaints"
                icon={<BarChart3 size={22} />}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Recent Complaints
                </h2>
              </div>

              {recentComplaints.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500">
                  No complaints available.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {safeText(complaint.title) ||
                            "Untitled Complaint"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {safeText(complaint.complaintNumber) ||
                            complaint.id}
                          {" • "}
                          {getComplaintBrandName(complaint)}
                          {" • "}
                          {getComplaintProductName(complaint)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                            complaint.status
                          )}`}
                        >
                          {statusLabel(complaint.status)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${severityClass(
                            complaint.severity
                          )}`}
                        >
                          {statusLabel(complaint.severity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Complaints */}
        {activeTab === "complaints" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-5 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={complaintSearch}
                  onChange={(event) =>
                    setComplaintSearch(event.target.value)
                  }
                  placeholder="Search complaint, product or brand..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div className="relative">
                <select
                  value={complaintStatus}
                  onChange={(event) =>
                    setComplaintStatus(event.target.value)
                  }
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_REVIEW">
                    Pending Review
                  </option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ACKNOWLEDGED">
                    Acknowledged
                  </option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DISPUTED">Disputed</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Complaint
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Brand
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Product
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredComplaints.map((complaint) => (
                    <React.Fragment key={complaint.id}>
                    <tr>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {safeText(complaint.title) ||
                            "Untitled Complaint"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {safeText(complaint.complaintNumber) ||
                            complaint.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {getComplaintBrandName(complaint)}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {getComplaintProductName(complaint)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                            complaint.status
                          )}`}
                        >
                          {statusLabel(complaint.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(complaint.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setExpandedComplaintId(expandedComplaintId === complaint.id ? null : complaint.id)}
                          className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                        >
                          {expandedComplaintId === complaint.id ? "Close" : "Review"}
                        </button>
                      </td>
                    </tr>
                    {expandedComplaintId === complaint.id && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 px-5 py-4 text-sm border-b border-gray-100">
                          <div className="flex flex-col gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">Description</h4>
                              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Contact Email</h4>
                              <p className="mt-1 text-gray-700">{complaint.contactEmail || "Not provided"}</p>
                            </div>
                            {complaint.status === "UNDER_REVIEW" && (
                              <div className="mt-2">
                                <button
                                  onClick={() => submitComplaint(complaint.id)}
                                  disabled={isSubmitting === complaint.id}
                                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                                >
                                  {isSubmitting === complaint.id ? "Submitting..." : "Submit Complaint"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  ))}

                  {filteredComplaints.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        No complaints found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <div className="relative max-w-xl">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={productSearch}
                  onChange={(event) =>
                    setProductSearch(event.target.value)
                  }
                  placeholder="Search product, brand, category or model..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Product
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Brand
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Category
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Model
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Complaints
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const complaintCount =
                      product.complaintCount ??
                      product._count?.complaints ??
                      0;

                    return (
                      <tr key={product.id}>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {getProductName(product)}
                          </p>

                          {safeText(product.type) && (
                            <p className="mt-1 text-xs text-gray-500">
                              {product.type}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {getBrandName(product)}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {safeText(product.category) || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {safeText(product.modelNumber) ||
                            safeText(product.modelName) ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {complaintCount}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <div className="relative max-w-xl">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(event.target.value)
                  }
                  placeholder="Search consumer..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Email
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Verified
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {safeText(user.legalName) ||
                          safeText(user.displayName) ||
                          "Unnamed User"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {safeText(user.email) || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {statusLabel(user.role)}
                      </td>

                      <td className="px-5 py-4">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-700">
                            <CheckCircle2 size={16} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                            <XCircle size={16} />
                            Not verified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {user.isActive === false ? (
                          <span className="text-red-600">
                            Inactive
                          </span>
                        ) : (
                          <span className="text-green-600">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        No consumers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Brands */}
        {activeTab === "brands" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <div className="relative max-w-xl">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={brandSearch}
                  onChange={(event) =>
                    setBrandSearch(event.target.value)
                  }
                  placeholder="Search brand..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Brand
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Category
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Website
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Verification
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id}>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {safeText(brand.name) || "Unnamed Brand"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {safeText(brand.category) || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {safeText(brand.officialWebsite) || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            brand.verificationStatus ===
                            "VERIFIED"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : brand.verificationStatus ===
                                  "REJECTED"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-yellow-200 bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {statusLabel(
                            brand.verificationStatus
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredBrands.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        No brands found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900">
                Complaint & Comment Reports
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review reported content and moderation issues.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <Flag
                  size={32}
                  className="mx-auto text-gray-300"
                />
                <p className="mt-3 text-sm text-gray-500">
                  No reports available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Reason
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Description
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {statusLabel(report.reason)}
                        </td>

                        <td className="max-w-md px-5 py-4 text-sm text-gray-600">
                          {safeText(report.description) || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                              report.status
                            )}`}
                          >
                            {statusLabel(report.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}