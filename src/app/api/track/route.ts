import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const number = request.nextUrl.searchParams.get("number")?.trim();
  if (!number) return NextResponse.json({ error: "Complaint number is required." }, { status: 400 });
  const complaint = await prisma.complaint.findUnique({ where: { complaintNumber: number }, include: { product: { include: { brand: true } }, statusHistory: { orderBy: { createdAt: "asc" } }, comments: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "asc" } } } });
  if (!complaint) return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
  return NextResponse.json({ ...complaint, consumerId: undefined, consumer: undefined });
}
