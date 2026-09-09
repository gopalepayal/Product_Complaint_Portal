import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const products = await prisma.product.findMany({ where: search ? { OR: [{ name: { contains: search } }, { modelName: { contains: search } }, { modelNumber: { contains: search } }, { brand: { name: { contains: search } } }] } : undefined, orderBy: { updatedAt: "desc" }, include: { brand: true, _count: { select: { complaints: true } } } });
  return NextResponse.json({ products });
}
