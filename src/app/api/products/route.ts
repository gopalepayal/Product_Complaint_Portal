import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { brand: true, _count: { select: { complaints: true } } },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("[Products API] Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}
