import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import type { ComplaintStatus } from "@prisma/client";
import { sendComplaintStatusUpdate } from "@/lib/notifications";

// GET /api/admin/complaints?status=&page=&search=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { complaintNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search } } },
        { product: { name: { contains: search } } },
        { consumer: { email: { contains: search } } },
      ];
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          consumer: { select: { legalName: true, displayName: true, email: true } },
          brand: { select: { name: true } },
          product: { select: { name: true } },
          _count: { select: { attachments: true, comments: true, votes: true } },
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({ complaints, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error("Admin complaints list error:", error);
    return NextResponse.json({ error: "Failed to fetch complaints." }, { status: 500 });
  }
}

// PATCH /api/admin/complaints — update status or assign brand
const patchSchema = z.object({
  complaintId: z.string().min(1),
  action: z.enum(["UPDATE_STATUS", "ASSIGN_BRAND"]),
  status: z.string().optional(),
  brandId: z.string().optional(),
  note: z.string().optional(),
  adminId: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { complaintId, action, status, brandId, note, adminId } = parsed.data;

    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    }

    if (action === "UPDATE_STATUS" && status) {
      const updated = await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status: status as ComplaintStatus,
          statusHistory: {
            create: {
              status: status as ComplaintStatus,
              note: note || `Status updated by admin.`,
              changedById: adminId,
            },
          },
        },
      });
      const complaintOwner = await prisma.user.findUnique({
        where: { id: complaint.consumerId },
        select: { email: true },
      });
      if (complaintOwner?.email) {
        await sendComplaintStatusUpdate({
          to: complaintOwner.email,
          complaintNumber: complaint.complaintNumber,
          previousStatus: complaint.status,
          newStatus: status,
          note,
          changedAt: updated.updatedAt,
        });
      }
      return NextResponse.json({ success: true, complaint: updated });
    }

    if (action === "ASSIGN_BRAND" && brandId) {
      const updated = await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          brandId,
        },
        include: { brand: { select: { name: true } } },
      });
      return NextResponse.json({ success: true, complaint: updated });
    }

    return NextResponse.json({ error: "Invalid action or missing fields." }, { status: 400 });
  } catch (error) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json({ error: "Failed to update complaint." }, { status: 500 });
  }
}
