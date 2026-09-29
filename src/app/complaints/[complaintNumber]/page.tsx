"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquare,
  Package,
  ShieldCheck,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

type RelatedComplaint = {
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
  updatedAt: string;
  isOwnComplaint: boolean;
};

type ComplaintDetail = {
  id: string;
  complaintNumber: string;
  title: string;
  description: string;

  incidentDate: string | null;
  purchaseDate: string | null;

  retailer: string | null;
  purchaseCity: string | null;
  purchaseState: string | null;
  purchaseCountry: string | null;

  issueCategory: string;
  severity: string;
  desiredResolution: string | null;

  isAnonymous: boolean;
  displayName: string;

  status: string;
  publishedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;

  createdAt: string;
  updatedAt: string;

  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    officialWebsite: string | null;
    verificationStatus: string;
  };

  product: {
    id: string;
    name: string;
    type: string;
    category: string;
    modelName: string | null;
    modelNumber: string | null;
    imageUrl: string | null;
  };

  voteCount: number;

  comments: {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: {
      type: string;
      displayName?: string;
      companyName?: string | null;
      jobTitle?: string | null;
    };
  }[];

  statusHistory: {
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
    changedBy: {
      id: string;
      displayName: string | null;
      role: string;
    } | null;
    brandRep: {
      id: string;
      companyName: string | null;
      jobTitle: string | null;
    } | null;
  }[];

  relatedComplaints: RelatedComplaint[];

  relatedComplaintCount: number;

  isOwner: boolean;
  isPrivileged: boolean;
  canSeePrivateInformation: boolean;
};

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function severityClass(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-700";

    case "HIGH":
      return "bg-orange-100 text-orange-700";

    case "LOW":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function ComplaintDetailPage() {
  const params = useParams();

  const complaintNumber = String(
    params.complaintNumber || ""
  );

  const [complaint, setComplaint] =
    useState<ComplaintDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!complaintNumber) {
      return;
    }

    async function loadComplaint() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/complaints/${encodeURIComponent(
            complaintNumber
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load complaint."
          );
        }

        setComplaint(data.complaint);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load complaint."
        );
      } finally {
        setLoading(false);
      }
    }

    loadComplaint();
  }, [complaintNumber]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-semibold text-slate-600">
              Loading complaint...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !complaint) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/complaints"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to complaints
          </Link>

          <div className="mt-8 rounded-xl border border-red-200 bg-white p-10 text-center">
            <h1 className="text-2xl font-black text-slate-900">
              Complaint unavailable
            </h1>

            <p className="mt-3 text-slate-600">
              {error ||
                "The complaint could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/complaints"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to complaints
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800">
              {statusLabel(complaint.status)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${severityClass(
                complaint.severity
              )}`}
            >
              {statusLabel(complaint.severity)} severity
            </span>

            <span className="font-mono text-xs font-bold text-slate-400">
              {complaint.complaintNumber}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {complaint.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="font-semibold">
              {complaint.brand.name}
            </span>

            <span>·</span>

            <span>
              {complaint.product.name}
            </span>

            <span>·</span>

            <span>
              {complaint.issueCategory}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* Complaint description */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-700" />

                <h2 className="text-xl font-black text-slate-900">
                  Complaint
                </h2>
              </div>

              <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">
                {complaint.description}
              </p>

              {complaint.desiredResolution && (
                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Desired resolution
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {complaint.desiredResolution}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4" />

                  {complaint.displayName}
                </span>

                <span className="inline-flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />

                  {complaint.voteCount} Me Too
                </span>

                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />

                  {formatDate(
                    complaint.createdAt
                  )}
                </span>
              </div>
            </section>

            {/* Same product complaints */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    Product complaint history
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Other complaints for this product
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Complaints from other consumers about the same product are shown here.
                  </p>
                </div>

                <div className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                  {complaint.relatedComplaintCount} other{" "}
                  {complaint.relatedComplaintCount === 1
                    ? "complaint"
                    : "complaints"}
                </div>
              </div>

              {complaint.relatedComplaints.length ===
              0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 font-semibold text-slate-700">
                    No other public complaints for this product yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    New complaints about this same product will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {complaint.relatedComplaints.map(
                    (related) => (
                      <Link
                        key={related.id}
                        href={`/complaints/${encodeURIComponent(
                          related.complaintNumber
                        )}`}
                        className="group block rounded-xl border border-slate-200 p-5 transition hover:border-teal-300 hover:bg-teal-50/30 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                                {statusLabel(
                                  related.status
                                )}
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${severityClass(
                                  related.severity
                                )}`}
                              >
                                {statusLabel(
                                  related.severity
                                )}
                              </span>

                              {related.isOwnComplaint && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                  Your complaint
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 font-bold text-slate-900 group-hover:text-teal-800">
                              {related.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                              {related.description}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span>
                                {related.displayName}
                              </span>

                              <span>·</span>

                              <span>
                                {related.issueCategory}
                              </span>

                              <span>·</span>

                              <span>
                                {formatDate(
                                  related.createdAt
                                )}
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700" />
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Comments */}
            {complaint.comments.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-teal-700" />

                  <h2 className="text-xl font-black text-slate-900">
                    Responses & comments
                  </h2>
                </div>

                <div className="mt-6 space-y-4">
                  {complaint.comments.map(
                    (comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {comment.author.type ===
                            "BRAND_REP"
                              ? comment.author
                                  .companyName ||
                                "Verified Brand Representative"
                              : comment.author
                                  .displayName ||
                                "Consumer"}
                          </span>

                          {comment.author.type ===
                            "BRAND_REP" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800">
                              <ShieldCheck className="h-3 w-3" />
                              Verified Brand
                            </span>
                          )}
                        </div>

                        {comment.author.jobTitle && (
                          <p className="mt-1 text-xs text-slate-500">
                            {comment.author.jobTitle}
                          </p>
                        )}

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {comment.content}
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          {formatDate(
                            comment.createdAt
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Status timeline */}
            {complaint.statusHistory.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-teal-700" />

                  <h2 className="text-xl font-black text-slate-900">
                    Complaint timeline
                  </h2>
                </div>

                <div className="mt-7 space-y-6 border-l-2 border-teal-100 pl-6">
                  {complaint.statusHistory.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="relative"
                      >
                        <CheckCircle2 className="absolute -left-[35px] top-0 h-5 w-5 rounded-full bg-white text-teal-700" />

                        <p className="font-bold text-slate-900">
                          {statusLabel(
                            item.status
                          )}
                        </p>

                        {item.note && (
                          <p className="mt-1 text-sm text-slate-600">
                            {item.note}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            item.createdAt
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Product sidebar */}
          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Product
              </p>

              {complaint.product.imageUrl && (
                <img
                  src={complaint.product.imageUrl}
                  alt={complaint.product.name}
                  className="mt-4 h-48 w-full rounded-lg object-contain bg-slate-50"
                />
              )}

              <h2 className="mt-5 text-xl font-black text-slate-900">
                {complaint.product.name}
              </h2>

              <p className="mt-2 font-semibold text-slate-600">
                {complaint.brand.name}
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.product.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Product type
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {complaint.product.type}
                  </p>
                </div>

                {complaint.product.modelName && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Model
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {complaint.product.modelName}
                    </p>
                  </div>
                )}

                {complaint.product.modelNumber && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Model number
                    </p>

                    <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                      {complaint.product.modelNumber}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Private information only for owner/admin */}
            {complaint.canSeePrivateInformation && (
              <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                  Your complaint details
                </p>

                <div className="mt-4 space-y-4 text-sm">
                  {complaint.purchaseDate && (
                    <div>
                      <p className="text-xs font-bold text-blue-600">
                        Purchase date
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {formatDate(
                          complaint.purchaseDate
                        )}
                      </p>
                    </div>
                  )}

                  {complaint.incidentDate && (
                    <div>
                      <p className="text-xs font-bold text-blue-600">
                        Incident date
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {formatDate(
                          complaint.incidentDate
                        )}
                      </p>
                    </div>
                  )}

                  {complaint.retailer && (
                    <div>
                      <p className="text-xs font-bold text-blue-600">
                        Retailer
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {complaint.retailer}
                      </p>
                    </div>
                  )}

                  {(complaint.purchaseCity ||
                    complaint.purchaseState) && (
                    <div>
                      <p className="text-xs font-bold text-blue-600">
                        Purchase location
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {[
                          complaint.purchaseCity,
                          complaint.purchaseState,
                          complaint.purchaseCountry,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}