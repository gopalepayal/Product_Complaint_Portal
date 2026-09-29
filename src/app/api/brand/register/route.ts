import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const brandRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  companyName: z.string().min(2, "Company name is required."),
  brandId: z.string().min(1, "Brand is required."),
  workEmail: z.string().email("Valid work email is required."),
  jobTitle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = brandRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      fullName,
      email,
      password,
      companyName,
      brandId,
      workEmail,
      jobTitle,
    } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedWorkEmail = workEmail.trim().toLowerCase();

    const brand = await prisma.brand.findUnique({
      where: {
        id: brandId,
      },
    });

    if (!brand) {
      return NextResponse.json(
        {
          error: "Selected brand was not found.",
        },
        { status: 404 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const existingRepresentative =
      await prisma.brandRepresentative.findFirst({
        where: {
          brandId,
          workEmail: normalizedWorkEmail,
        },
      });

    if (existingRepresentative) {
      return NextResponse.json(
        {
          error:
            "A representative with this work email has already registered for this brand.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          legalName: fullName.trim(),
          email: normalizedEmail,
          passwordHash,
          role: "BRAND_REP",
          isVerified: false,
          verifiedAt: null,
          isActive: true,
        },
      });

      const representative = await tx.brandRepresentative.create({
        data: {
          userId: user.id,
          brandId: brand.id,
          companyName: companyName.trim(),
          workEmail: normalizedWorkEmail,
          jobTitle: jobTitle?.trim() || null,
          status: "PENDING",
        },
      });

      return {
        user,
        representative,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Brand representative registration submitted successfully. Your account is pending admin verification.",
        userId: result.user.id,
        representativeId: result.representative.id,
        status: result.representative.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Brand representative registration error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Brand representative registration failed.",
      },
      { status: 500 }
    );
  }
}