import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminAction = "VERIFY" | "REJECT" | "REVOKE";

function getRole(session: unknown): string | undefined {
  return (session as { user?: { role?: string } } | null)?.user?.role;
}

function getUserId(session: unknown): string | undefined {
  return (session as { user?: { id?: string } } | null)?.user?.id;
}

/**
 * GET
 * Fetch all brand representative applications.
 * Only ADMIN and MODERATOR can access this endpoint.
 */
export async function GET() {
  try {
    const session = await auth();

    const role = getRole(session);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.json(
        {
          error:
            "You are not authorized to view brand representative applications.",
        },
        { status: 403 }
      );
    }

    const representatives =
      await prisma.brandRepresentative.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              legalName: true,
              email: true,
              displayName: true,
              isVerified: true,
              isActive: true,
              createdAt: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              verificationStatus: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              legalName: true,
              email: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        representatives,
        total: representatives.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Failed to fetch brand representatives:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch brand representatives.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 * Verify, reject, or revoke a brand representative.
 * Only ADMIN and MODERATOR can perform these actions.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    const role = getRole(session);
    const adminId = getUserId(session);

    if (!session?.user || !adminId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.json(
        {
          error:
            "You are not authorized to manage brand representatives.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const representativeId =
      typeof body.representativeId === "string"
        ? body.representativeId.trim()
        : "";

    const action =
      typeof body.action === "string"
        ? (body.action.toUpperCase() as AdminAction)
        : "";

    const note =
      typeof body.note === "string"
        ? body.note.trim()
        : "";

    if (!representativeId) {
      return NextResponse.json(
        {
          error: "Representative ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !["VERIFY", "REJECT", "REVOKE"].includes(action)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid action. Use VERIFY, REJECT, or REVOKE.",
        },
        { status: 400 }
      );
    }

    const representative =
      await prisma.brandRepresentative.findUnique({
        where: {
          id: representativeId,
        },
        include: {
          user: true,
          brand: true,
        },
      });

    if (!representative) {
      return NextResponse.json(
        {
          error:
            "Brand representative application not found.",
        },
        { status: 404 }
      );
    }

    let newStatus:
      | "VERIFIED"
      | "REJECTED"
      | "REVOKED";

    if (action === "VERIFY") {
      newStatus = "VERIFIED";
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
    } else {
      newStatus = "REVOKED";
    }

    const now = new Date();

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedRepresentative =
          await tx.brandRepresentative.update({
            where: {
              id: representativeId,
            },
            data: {
              status: newStatus,
              reviewedById: adminId,
              reviewedAt: now,
            },
            include: {
              user: true,
              brand: true,
            },
          });

        const updatedUser =
          await tx.user.update({
            where: {
              id: representative.userId,
            },
            data: {
              isVerified: action === "VERIFY",
              verifiedAt:
                action === "VERIFY"
                  ? now
                  : null,
              isActive:
                action !== "REVOKE",
            },
          });

        await tx.notification.create({
          data: {
            userId: representative.userId,
            title:
              action === "VERIFY"
                ? "Brand Representative Verified"
                : action === "REJECT"
                  ? "Brand Representative Application Rejected"
                  : "Brand Representative Access Revoked",

            message:
              action === "VERIFY"
                ? `Your representative account for ${representative.brand.name} has been verified. You can now access the brand dashboard.`
                : action === "REJECT"
                  ? `Your representative application for ${representative.brand.name} was rejected.${note ? ` Reason: ${note}` : ""}`
                  : `Your representative access for ${representative.brand.name} has been revoked.${note ? ` Reason: ${note}` : ""}`,
          },
        });

        return {
          updatedRepresentative,
          updatedUser,
        };
      }
    );

    return NextResponse.json(
      {
        success: true,

        message:
          action === "VERIFY"
            ? "Brand representative verified successfully."
            : action === "REJECT"
              ? "Brand representative application rejected."
              : "Brand representative access revoked.",

        representative: {
          id: result.updatedRepresentative.id,
          status:
            result.updatedRepresentative.status,
          userId:
            result.updatedRepresentative.userId,
          brandId:
            result.updatedRepresentative.brandId,
          brandName:
            result.updatedRepresentative.brand.name,
          workEmail:
            result.updatedRepresentative.workEmail,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin brand representative action failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update brand representative.",
      },
      { status: 500 }
    );
  }
}