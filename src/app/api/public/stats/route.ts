import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required
// Returns only aggregate counts, no PII
export async function GET() {
  try {
    const [totalComplaints, resolvedComplaints, totalBrands, totalConsumers] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
      prisma.brand.count(),
      prisma.user.count({ where: { role: "CONSUMER" } }),
    ]);

    return NextResponse.json({
      totalComplaints,
      resolvedComplaints,
      totalBrands,
      totalConsumers,
    });
  } catch {
    return NextResponse.json({ totalComplaints: 0, resolvedComplaints: 0, totalBrands: 0, totalConsumers: 0 });
  }
}
