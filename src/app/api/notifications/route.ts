import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50, include: { complaint: { select: { complaintNumber: true, title: true } } } });
  return NextResponse.json({ success: true, data: notifications });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { id?: string; isRead?: boolean };
  if (!body.id || typeof body.isRead !== "boolean") return NextResponse.json({ error: "Notification id and read state are required." }, { status: 400 });
  const result = await prisma.notification.updateMany({ where: { id: body.id, userId }, data: { isRead: body.isRead } });
  if (!result.count) return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
