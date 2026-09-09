import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/brands — list all brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { complaints: true, representatives: true, products: true } },
      },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Admin brands error:", error);
    return NextResponse.json({ error: "Failed to fetch brands." }, { status: 500 });
  }
}
