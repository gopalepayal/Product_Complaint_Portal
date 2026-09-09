import React from "react";
import { prisma } from "@/lib/prisma";
import AdminSafetyClient from "./AdminSafetyClient";

export const dynamic = "force-dynamic";

export default async function AdminSafetyPage() {
  let notices: any[] = [];
  try {
    notices = await (prisma as any).safetyNotice.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching safety notices for admin:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Safety Notices Administration</h1>
        <p className="text-slate-500 mb-8">Manage product safety notices, recalls, and consumer advisories.</p>
        
        <AdminSafetyClient initialNotices={notices} />
      </div>
    </div>
  );
}
