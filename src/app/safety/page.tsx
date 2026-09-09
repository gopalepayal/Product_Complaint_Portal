import React from "react";
import { prisma } from "@/lib/prisma";
import SafetyClient from "./SafetyClient";

export const dynamic = "force-dynamic";

export default async function SafetyPage() {
  let notices: any[] = [];
  try {
    // Fallback using any in case prisma generate failed on Windows due to locked files
    notices = await (prisma as any).safetyNotice?.findMany({
      orderBy: { createdAt: "desc" },
    }) ?? [];
  } catch (error) {
    console.error("Error fetching safety notices:", error);
    notices = [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. Header */}
      <section className="bg-white border-b border-slate-200 pt-16 pb-16 lg:pt-20 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-3 py-1 bg-red-50 border border-red-100 text-red-700 text-xs font-bold mb-6 uppercase tracking-widest rounded shadow-sm">
            Consumer Protection
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Product Safety & Alerts
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Stay informed about verified product safety notices, quality advisories and recalls.
          </p>
        </div>
      </section>

      {/* Main Content (Client Component for interactive search & tabs) */}
      <SafetyClient initialNotices={notices} />

    </div>
  );
}
