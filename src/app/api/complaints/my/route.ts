import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  const complaints = await prisma.complaint.findMany({ where: { consumerId: session.user.id }, orderBy: { createdAt: "desc" }, include: { product: { select: { name: true, brand: { select: { name: true } } } } } });
  return NextResponse.json(complaints);
}
