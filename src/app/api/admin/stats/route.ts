import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalComplaints, totalConsumers, totalBrands, statusRows, recentComplaints, complaintsByProduct, complaintsByBrand, complaintsByCategory] = await Promise.all([
      prisma.complaint.count(),
      prisma.user.count({ where: { role: "CONSUMER" } }),
      prisma.brand.count(),
      prisma.complaint.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.complaint.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          consumer: { select: { legalName: true, displayName: true, email: true } },
          brand: { select: { name: true } },
          product: { select: { name: true } },
          _count: { select: { attachments: true, comments: true, votes: true } },
        },
      }),
      prisma.complaint.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 6,
      }),
      prisma.complaint.groupBy({
        by: ["brandId"],
        _count: { brandId: true },
        orderBy: { _count: { brandId: "desc" } },
        take: 6,
      }),
      prisma.complaint.groupBy({
        by: ["issueCategory"],
        _count: { issueCategory: true },
        orderBy: { _count: { issueCategory: "desc" } },
        take: 6,
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const row of statusRows) {
      statusCounts[row.status] = row._count.status ?? 0;
    }

    const productIds = complaintsByProduct.map((row) => row.productId);
    const brandIds = complaintsByBrand.map((row) => row.brandId);

    const [productMap, brandMap] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      }).then((items) => Object.fromEntries(items.map((item) => [item.id, item.name]))),
      prisma.brand.findMany({
        where: { id: { in: brandIds } },
        select: { id: true, name: true },
      }).then((items) => Object.fromEntries(items.map((item) => [item.id, item.name]))),
    ]);

    return NextResponse.json({
      totalComplaints,
      totalConsumers,
      totalBrands,
      statusCounts,
      recentComplaints,
      complaintsByProduct: complaintsByProduct.map((row) => ({
        name: productMap[row.productId] || "Unknown product",
        count: row._count.productId ?? 0,
      })),
      complaintsByBrand: complaintsByBrand.map((row) => ({
        name: brandMap[row.brandId] || "Unknown brand",
        count: row._count.brandId ?? 0,
      })),
      complaintsByCategory: complaintsByCategory.map((row) => ({
        name: row.issueCategory,
        count: row._count.issueCategory ?? 0,
      })),
    });
  } catch (error) {
    console.error("Admin stats error", error);
    return NextResponse.json({ error: "Failed to load statistics." }, { status: 500 });
  }
}
