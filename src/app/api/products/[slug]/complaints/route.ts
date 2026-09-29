import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id ?? null;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: slug },
      select: { id: true, name: true, brandId: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // Fetch only publicly visible complaints for this product (by exact Product ID and Brand ID)
    // Only expose public-safe fields — never email, phone, address, purchase info
    const complaints = await prisma.complaint.findMany({
      where: {
        productId: product.id,
        brandId: product.brandId,
        status: { in: publicStatuses },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
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

    const sanitized = complaints.map((c) => ({
      id: c.id,
      complaintNumber: c.complaintNumber,
      title: c.title,
      description: c.description,
      issueCategory: c.issueCategory,
      severity: c.severity,
      status: c.status,
      displayName: c.isAnonymous
        ? "Anonymous"
        : c.displayName || "Consumer",
      isAnonymous: c.isAnonymous,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      isOwnComplaint:
        !!currentUserId && c.consumerId === currentUserId,
    }));

    return NextResponse.json({ complaints: sanitized, total: sanitized.length });
  } catch (error) {
    console.error("GET /api/products/[slug]/complaints error:", error);
    return NextResponse.json(
      { error: "Unable to load complaints." },
      { status: 500 }
    );
  }
}
