import { NextRequest, NextResponse } from "next/server";
import type { ComplaintSeverity, ComplaintStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const publicStatuses: ComplaintStatus[] = ["PUBLISHED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "DISPUTED"];
const validSeverities: ComplaintSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const category = params.get("category")?.trim();
  const brandId = params.get("brandId")?.trim();
  const productId = params.get("productId")?.trim();
  const requestedStatus = params.get("status")?.toUpperCase() as ComplaintStatus | undefined;
  const requestedSeverity = params.get("severity")?.toUpperCase() as ComplaintSeverity | undefined;
  const page = Math.max(1, Number(params.get("page") || 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit") || 20) || 20));
  const where: Prisma.ComplaintWhereInput = {
    status: requestedStatus && publicStatuses.includes(requestedStatus) ? requestedStatus : { in: publicStatuses },
    ...(brandId ? { brandId } : {}),
    ...(productId ? { productId } : {}),
    ...(category ? { issueCategory: category } : {}),
    ...(requestedSeverity && validSeverities.includes(requestedSeverity) ? { severity: requestedSeverity } : {}),
    ...(search ? { OR: [{ title: { contains: search } }, { description: { contains: search } }, { complaintNumber: { contains: search } }, { product: { name: { contains: search } } }, { brand: { name: { contains: search } } }] } : {}),
  };

  try {
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { product: { include: { brand: true } }, _count: { select: { comments: true, votes: true, reports: true, attachments: true } } } }),
      prisma.complaint.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: complaints.map((complaint) => ({ ...complaint, consumer: complaint.isAnonymous ? { displayName: "Anonymous" } : { displayName: complaint.displayName }, counts: { comments: complaint._count.comments, meToo: complaint._count.votes, reports: complaint._count.reports, attachments: complaint._count.attachments } })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("GET /api/complaints error", error);
    return NextResponse.json({ success: false, message: "Unable to load complaints." }, { status: 500 });
  }
}
