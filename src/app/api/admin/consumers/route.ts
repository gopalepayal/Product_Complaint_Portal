import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createConsumerSchema = z.object({
  legalName: z.string().trim().min(2),
  displayName: z.string().trim().optional(),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const page = Math.max(1, Number(params.get("page") || 1) || 1);
  const pageSize = 20;
  const where: Prisma.UserWhereInput = { role: "CONSUMER", ...(search ? { OR: [{ legalName: { contains: search } }, { email: { contains: search } }] } : {}) };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { _count: { select: { complaints: true } } } }),
    prisma.user.count({ where }),
  ]);
  return NextResponse.json({ consumers: users.map(({ passwordHash, ...user }) => user), total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  try {
    const parsed = createConsumerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide a valid name, email, and password." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }

    const consumer = await prisma.user.create({
      data: {
        legalName: parsed.data.legalName,
        displayName: parsed.data.displayName || null,
        email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        role: "CONSUMER",
        isVerified: true,
        verifiedAt: new Date(),
        isActive: true,
      },
      select: { id: true, legalName: true, displayName: true, email: true, role: true, isVerified: true, isActive: true },
    });

    return NextResponse.json({ consumer }, { status: 201 });
  } catch (error) {
    console.error("Admin consumer creation error:", error);
    return NextResponse.json({ error: "Failed to create consumer." }, { status: 500 });
  }
}
