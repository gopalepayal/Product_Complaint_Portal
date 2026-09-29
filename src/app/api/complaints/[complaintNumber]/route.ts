import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@prisma/client";

// Import the intended existing moderation rule
const publicStatuses: ComplaintStatus[] = [
  "PUBLISHED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "DISPUTED",
];

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ complaintNumber: string }> }
) {
  try {
    const { complaintNumber } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id ?? null;
    const currentUserRole = (session?.user as { role?: string } | undefined)
      ?.role;

    const isPrivileged =
      currentUserRole === "ADMIN" ||
      currentUserRole === "MODERATOR" ||
      currentUserRole === "BRAND_REP";

    // Load the main complaint with full detail
    const complaint = await prisma.complaint.findUnique({
      where: { complaintNumber },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            officialWebsite: true,
            verificationStatus: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            modelName: true,
            modelNumber: true,
            imageUrl: true,
          },
        },
        _count: { select: { votes: true } },
        comments: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { displayName: true, legalName: true, role: true },
            },
            brandRepresentative: {
              select: { companyName: true, jobTitle: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: {
            changedBy: {
              select: { id: true, displayName: true, role: true },
            },
            brandRep: {
              select: { id: true, companyName: true, jobTitle: true },
            },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found." },
        { status: 404 }
      );
    }

    const isOwner = !!currentUserId && complaint.consumerId === currentUserId;
    const canSeePrivateInformation = isOwner || isPrivileged;

    // Fetch all OTHER complaints for the SAME product (grouped by productId)
    // Only show public-safe fields — never expose email, phone, address, purchase info
    const relatedRaw = await prisma.complaint.findMany({
      where: {
        brandId: complaint.brandId,
        productId: complaint.productId,
        id: { not: complaint.id },
        status: { in: publicStatuses },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        complaintNumber: true,
        title: true,
        description: true,
        issueCategory: true,
        severity: true,
        status: true,
        displayName: true,
        isAnonymous: true,
        consumerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const relatedComplaints = relatedRaw.map((r) => ({
      id: r.id,
      complaintNumber: r.complaintNumber,
      title: r.title,
      description: r.description,
      issueCategory: r.issueCategory,
      severity: r.severity,
      status: r.status,
      displayName: r.isAnonymous ? "Anonymous" : (r.displayName || "Consumer"),
      isAnonymous: r.isAnonymous,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      isOwnComplaint: !!currentUserId && r.consumerId === currentUserId,
    }));

    // Build sanitized comments
    const comments = complaint.comments.map((c) => {
      const isBrandRep = !!c.brandRepresentative;
      return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        author: isBrandRep
          ? {
              type: "BRAND_REP",
              companyName: c.brandRepresentative?.companyName ?? null,
              jobTitle: c.brandRepresentative?.jobTitle ?? null,
            }
          : {
              type: "CONSUMER",
              displayName:
                c.user.displayName || c.user.legalName || "Consumer",
            },
      };
    });

    // Build status history
    const statusHistory = complaint.statusHistory.map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note,
      createdAt: h.createdAt.toISOString(),
      changedBy: h.changedBy
        ? {
            id: h.changedBy.id,
            displayName: h.changedBy.displayName,
            role: h.changedBy.role,
          }
        : null,
      brandRep: h.brandRep
        ? {
            id: h.brandRep.id,
            companyName: h.brandRep.companyName,
            jobTitle: h.brandRep.jobTitle,
          }
        : null,
    }));

    const result = {
      id: complaint.id,
      complaintNumber: complaint.complaintNumber,
      title: complaint.title,
      description: complaint.description,

      // Private fields — only for owner/admin/moderator
      incidentDate: canSeePrivateInformation
        ? complaint.incidentDate?.toISOString() ?? null
        : null,
      purchaseDate: canSeePrivateInformation
        ? complaint.purchaseDate?.toISOString() ?? null
        : null,
      retailer: canSeePrivateInformation ? complaint.retailer : null,
      purchaseCity: canSeePrivateInformation ? complaint.purchaseCity : null,
      purchaseState: canSeePrivateInformation ? complaint.purchaseState : null,
      purchaseCountry: canSeePrivateInformation
        ? complaint.purchaseCountry
        : null,

      issueCategory: complaint.issueCategory,
      severity: complaint.severity,
      desiredResolution: complaint.desiredResolution,

      isAnonymous: complaint.isAnonymous,
      displayName: complaint.isAnonymous
        ? "Anonymous"
        : complaint.displayName || "Consumer",

      status: complaint.status,
      publishedAt: complaint.publishedAt?.toISOString() ?? null,
      resolvedAt: complaint.resolvedAt?.toISOString() ?? null,
      closedAt: complaint.closedAt?.toISOString() ?? null,

      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),

      brand: complaint.brand,
      product: complaint.product,

      voteCount: complaint._count.votes,
      comments,
      statusHistory,

      relatedComplaints,
      relatedComplaintCount: relatedComplaints.length,

      isOwner,
      isPrivileged,
      canSeePrivateInformation,
    };

    return NextResponse.json({ complaint: result });
  } catch (error) {
    console.error("GET /api/complaints/[complaintNumber] error:", error);
    return NextResponse.json(
      { error: "Unable to load complaint." },
      { status: 500 }
    );
  }
}
