"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Package, ShieldCheck, ChevronRight, UserRound, CalendarDays } from "lucide-react";

type ProductComplaint = {
  id: string;
  complaintNumber: string;
  title: string;
  description: string;
  issueCategory: string;
  severity: string;
  status: string;
  displayName: string;
  isAnonymous: boolean;
  createdAt: string;
  isOwnComplaint: boolean;
};

function statusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function severityClass(severity: string) {
  switch (severity) {
    case "CRITICAL": return "bg-red-100 text-red-700";
    case "HIGH": return "bg-orange-100 text-orange-700";
    case "LOW": return "bg-gray-100 text-gray-700";
    default: return "bg-yellow-100 text-yellow-700";
  }
}

type Product = {
  id: string;
  name: string;
  type: string;
  category: string;
  modelName: string | null;
  modelNumber: string | null;
  imageUrl: string | null;
  brand: {
    name: string;
    slug: string;
    officialWebsite: string | null;
  };
  _count: {
    complaints: number;
  };
};

// Map specific products to their exact official URLs if available, fallback to brand.officialWebsite
const getOfficialUrl = (product: Product) => {
  const name = product.name.toLowerCase();
  if (name.includes("lg 9kg front load")) return "https://www.lg.com/in/washing-machines";
  if (name.includes("apple airpods")) return "https://www.apple.com/in/airpods/";
  if (name.includes("apple airtag")) return "https://www.apple.com/in/airtag/";
  if (name.includes("iphone 15")) return "https://www.apple.com/in/iphone-15/";
  if (name.includes("bosch 8kg")) return "https://www.bosch-home.in/products/washers-dryers";
  if (name.includes("good day")) return "https://britannia.co.in/products/good-day";
  if (name.includes("revitalift")) return "https://www.loreal-paris.co.in/revitalift";
  if (name.includes("hyaluron")) return "https://www.loreal-paris.co.in/skin-care/hyaluron-expert";
  return product.brand.officialWebsite;
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ brand: string; productId: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [complaints, setComplaints] = useState<ProductComplaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { productId } = await params;

        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          setNotFound(true);
          return;
        }

        const data = await response.json();
        setProduct(data);

        // Load complaints for this product
        setComplaintsLoading(true);
        try {
          const cRes = await fetch(`/api/products/${productId}/complaints`);
          if (cRes.ok) {
            const cData = await cRes.json();
            setComplaints(cData.complaints ?? []);
          }
        } catch {
          // Non-fatal: complaints section just stays empty
        } finally {
          setComplaintsLoading(false);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params]);


  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
            Product Not Found
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            This product could not be found in the product directory.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Product Directory
          </Link>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                {product.category}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {product.type}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-2 text-lg font-semibold text-gray-600">
              {product.brand.name}
            </p>
          </div>
        </div>
      </section>

      {/* Product Information */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Product Info */}
          <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                <Package className="h-6 w-6 text-teal-700" />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Product Information
                </h2>

                <p className="text-sm text-gray-500">
                  Public product information and complaint history
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Product Name
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {product.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Brand
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {product.brand.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Category
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {product.category}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Product Type
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {product.type}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Model Name
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {product.modelName || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Model Number
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {product.modelNumber || "Not provided"}
                </p>
              </div>
            </div>

            {getOfficialUrl(product) && (
              <div className="mt-8 border-t border-gray-100 pt-5">
                <a
                  href={getOfficialUrl(product)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-200"
                >
                  Visit Official Website
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Image and Complaint Summary */}
          <div className="flex flex-col gap-6">
            {/* Product Image */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
              {product.imageUrl ? (
                <div className="relative w-full h-64 bg-white p-6 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.imageUrl} 
                    alt={`${product.brand.name} ${product.name}`} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply text-gray-500 text-xs font-medium text-center"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                  <Package className="h-10 w-10 mb-2 opacity-50" />
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-70">No image available</span>
                </div>
              )}
            </div>

            {/* Complaint Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>

            <h2 className="mt-5 text-lg font-extrabold text-gray-900">
              Complaint History
            </h2>

            <div className="mt-5">
              <p className="text-4xl font-black text-gray-900">
                {product._count.complaints}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                complaint records
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-700" />

                <p className="text-xs leading-5 text-gray-600">
                  Complaint information is displayed for public research and
                  transparency. It does not represent a final legal or
                  regulatory finding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900">
            Have an issue with this product?
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You can submit a complaint about this product through the consumer
            complaint portal.
          </p>

          <Link
            href={`/submit?productId=${encodeURIComponent(product.id)}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            File a Complaint
          </Link>
        </div>

        {/* Customer Complaints Section */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Product complaint history
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                Customer Complaints
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                All public complaints submitted by customers for this product.
              </p>
            </div>
            <div className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
              Total: {complaints.length}
            </div>
          </div>

          {complaintsLoading ? (
            <p className="mt-6 text-center text-sm text-gray-500">
              Loading complaints...
            </p>
          ) : complaints.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <Package className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-3 font-semibold text-gray-700">
                No complaints submitted for this product yet.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to file a complaint if you have an issue.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {complaints.map((c, idx) => (
                <Link
                  key={c.id}
                  href={`/complaints/${encodeURIComponent(c.complaintNumber)}`}
                  className="group block rounded-xl border border-gray-200 p-5 transition hover:border-teal-300 hover:bg-teal-50/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          #{idx + 1}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-700">
                          {statusLabel(c.status)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${severityClass(c.severity)}`}
                        >
                          {statusLabel(c.severity)}
                        </span>
                        {c.isOwnComplaint && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            Your complaint
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-bold text-gray-900 group-hover:text-teal-800">
                        {c.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {c.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="h-3.5 w-3.5" />
                          {c.displayName}
                        </span>
                        <span>·</span>
                        <span>{c.issueCategory}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-gray-400 transition group-hover:trangray-x-1 group-hover:text-teal-700" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
