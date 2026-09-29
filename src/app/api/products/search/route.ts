import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim() || "";
    const brandId = searchParams.get("brandId")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    if (!query && !brandId && !type && !category) {
      return NextResponse.json(
        {
          error:
            "Please provide a search query, brand, product type, or category.",
        },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        mergedIntoId: null,

        ...(brandId
          ? {
              brandId: brandId,
            }
          : {}),

        ...(type
          ? {
              type: {
                contains: type,
              },
            }
          : {}),

        ...(category
          ? {
              category: {
                contains: category,
              },
            }
          : {}),

        ...(query
          ? {
              OR: [
                {
                  name: {
                    contains: query,
                  },
                },
                {
                  type: {
                    contains: query,
                  },
                },
                {
                  category: {
                    contains: query,
                  },
                },
                {
                  modelName: {
                    contains: query,
                  },
                },
                {
                  modelNumber: {
                    contains: query,
                  },
                },
                {
                  brand: {
                    name: {
                      contains: query,
                    },
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        modelName: true,
        modelNumber: true,
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
            logoUrl: true,
            category: true,
            officialWebsite: true,
            verificationStatus: true,
          },
        },

        _count: {
          select: {
            complaints: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 50,
    });

    return NextResponse.json(
      {
        success: true,
        query,
        filters: {
          brandId: brandId || null,
          type: type || null,
          category: category || null,
        },
        total: products.length,
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          type: product.type,
          category: product.category,
          modelName: product.modelName,
          modelNumber: product.modelNumber,
          imageUrl: product.imageUrl,
          description: product.description,
          purchaseLocation: product.purchaseLocation,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,

          brand: product.brand,

          complaintCount: product._count.complaints,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product search error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to search products.",
      },
      { status: 500 }
    );
  }
}