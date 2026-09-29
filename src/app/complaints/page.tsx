"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

const CATEGORIES = [
  {
    label: "Pharmaceutical",
    desc: "Medicines & Drugs",
    icon: "💊",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Nutraceutical",
    desc: "Supplements & Vitamins",
    icon: "🌿",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Medical Device",
    desc: "Equipment & Devices",
    icon: "🩺",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Cosmetics & Beauty",
    desc: "Skincare, Hair & Makeup",
    icon: "✨",
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Personal Care",
    desc: "OTC & Hygiene Products",
    icon: "🧴",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Ayurvedic",
    desc: "Herbal & Natural Products",
    icon: "🌱",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Surgical",
    desc: "Surgical & Disposables",
    icon: "🏥",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Diagnostic",
    desc: "Test Kits & Diagnostics",
    icon: "🔬",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=85",
  },

  // Electronics & General Consumer Categories
  {
    label: "Mobile & Tablets",
    desc: "iPhone, Smartphones & Tablets",
    icon: "📱",
    image:
      "https://images.unsplash.com/photo-1592286927505-2fd0d9d0d9a3?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Home Appliances",
    desc: "Washing Machines, AC & More",
    icon: "🧺",
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Electronics",
    desc: "TV, Audio & Electronic Products",
    icon: "📺",
    image:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Clothing & Accessories",
    desc: "Clothes & Accessories",
    icon: "👕",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Shoes / Footwear",
    desc: "Sneakers, Boots & Shoes",
    icon: "👟",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Computing",
    desc: "Laptops, Desktops & Accessories",
    icon: "💻",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Automotive",
    desc: "Cars, Bikes & Auto Parts",
    icon: "🚗",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Food & Beverages",
    desc: "Packaged Food & Drinks",
    icon: "🍔",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",
  },
  {
    label: "Household Products",
    desc: "Cleaning & Daily Needs",
    icon: "🧹",
    image:
      "https://images.unsplash.com/photo-1584824486509-112e4181f1ce?auto=format&fit=crop&w=900&q=85",
  },
];

const COMPLAINT_TYPES = [
  "Quality Defect",
  "Adverse Reaction",
  "Contamination",
  "Incorrect Labelling",
  "Substandard / Ineffective",
  "Expired Product",
  "Damaged Packaging",
  "Wrong Product",
  "Missing Contents",
  "Counterfeit Product",
  "Other",
];

export default function ComplaintsPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      router.push(`/track?id=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="text-slate-700">Complaints</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Consumer Complaint Portal
          </h1>

          <p className="text-slate-500 text-base">
            Submit, track and manage product grievances. All complaints are
            verified and followed up by our team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Track Complaint */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <Search className="h-5 w-5 text-blue-700" />

                <h2 className="text-lg font-bold text-slate-900">
                  Track an Existing Complaint
                </h2>
              </div>

              <p className="text-slate-500 text-sm mb-4">
                Enter your Complaint ID (e.g.{" "}
                <span className="font-mono font-semibold text-slate-700">
                  PCP-2026-000001
                </span>
                ) to view status and timeline.
              </p>

              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter Complaint ID..."
                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Track
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Link
                href="/submit"
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-blue-700" />
                </div>

                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                  Submit a New Complaint
                </h3>

                <p className="text-slate-500 text-sm mb-3">
                  Report a product issue with full details, evidence, and
                  purchase information.
                </p>

                <span className="inline-flex items-center gap-1 text-blue-700 text-sm font-semibold">
                  Get started
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-700" />
                </div>

                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                  My Complaints
                </h3>

                <p className="text-slate-500 text-sm mb-3">
                  View all your submitted complaints, status updates and
                  resolution details.
                </p>

                <span className="inline-flex items-center gap-1 text-blue-700 text-sm font-semibold">
                  Open Dashboard
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>

            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">
                Browse by Category
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    href={`/submit?category=${encodeURIComponent(
                      cat.label
                    )}`}
                    className="overflow-hidden bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all text-center group"
                  >
                    {/* Image */}
                    <div className="w-full h-32 overflow-hidden bg-slate-100">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Category Info */}
                    <div className="p-3">
                      <div className="text-2xl mb-1.5">
                        {cat.icon}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {cat.label}
                      </p>

                      <p className="text-slate-400 text-xs mt-0.5">
                        {cat.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Complaint Types */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">
                Types of Complaints We Handle
              </h2>

              <div className="flex flex-wrap gap-2">
                {COMPLAINT_TYPES.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">

            {/* Account Required */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />

                <h3 className="font-bold text-amber-800">
                  Account Required
                </h3>
              </div>

              <p className="text-amber-700 text-sm">
                You need a verified account to submit a complaint.{" "}
                <Link
                  href="/register"
                  className="underline font-semibold"
                >
                  Register here
                </Link>{" "}
                or{" "}
                <Link
                  href="/login"
                  className="underline font-semibold"
                >
                  log in
                </Link>{" "}
                if you already have an account.
              </p>
            </div>

            {/* Complaint Lifecycle */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-700" />

                <h3 className="font-bold text-slate-900">
                  Complaint Lifecycle
                </h3>
              </div>

              <ol className="space-y-2.5">
                {[
                  "Submitted",
                  "Under Review",
                  "Verified",
                  "Assigned to Brand",
                  "Investigation",
                  "Action Taken",
                  "Resolved",
                  "Closed",
                ].map((step, i) => (
                  <li
                    key={step}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>

                    <span className="text-slate-700">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Evidence Tips */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-green-700" />

                <h3 className="font-bold text-slate-900">
                  Evidence Tips
                </h3>
              </div>

              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">
                    ✓
                  </span>
                  Clear photos of the product defect
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">
                    ✓
                  </span>
                  Purchase receipt or invoice
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">
                    ✓
                  </span>
                  Product packaging with batch number
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">
                    ✓
                  </span>
                  Medical reports if health was affected
                </li>
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-blue-700" />

                <h3 className="font-bold text-slate-900">
                  Need Help?
                </h3>
              </div>

              <p className="text-slate-500 text-sm mb-3">
                Our support team is available to assist you through the
                complaint process.
              </p>

              <Link
                href="/about"
                className="text-blue-700 text-sm font-semibold hover:underline"
              >
                Contact Support →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}