import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const createProductSchema = z.object({
  brandId: z.string().min(1, "Brand is required."),
  name: z.string().min(2, "Product name is required."),
  type: z.string().min(2, "Product type is required."),
  category: z.string().min(2, "Product category is required."),
  modelName: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(5000).optional(),
  purchaseLocation: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session?.user || !userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product information.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const brand = await prisma.brand.findUnique({
      where: {
        id: data.brandId,
      },
      select: {
        id: true,
        name: true,
        verificationStatus: true,
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Selected brand was not found." },
        { status: 404 }
      );
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        brandId: data.brandId,
        name: {
          equals: data.name.trim(),
        },
        ...(data.modelNumber?.trim()
          ? {
              modelNumber: {
                equals: data.modelNumber.trim(),
              },
            }
          : {}),
        mergedIntoId: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        modelName: true,
        modelNumber: true,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          error: "This product already exists.",
          existingProduct,
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        brandId: data.brandId,
        name: data.name.trim(),
        type: data.type.trim(),
        category: data.category.trim(),
        modelName: data.modelName?.trim() || null,
        modelNumber: data.modelNumber?.trim() || null,
        serialNumber: data.serialNumber?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        description: data.description?.trim() || null,
        purchaseLocation: data.purchaseLocation?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        modelName: true,
        modelNumber: true,
        serialNumber: true,
        imageUrl: true,
        description: true,
        purchaseLocation: true,
        createdAt: true,
        updatedAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            verificationStatus: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create product.",
      },
      { status: 500 }
    );
  }
}