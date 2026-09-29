import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    const userId = session?.user?.id;
    const role = (
      session?.user as { role?: string } | undefined
    )?.role;

    if (!session?.user || !userId) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (role !== "BRAND_REP") {
      return NextResponse.json(
        {
          error:
            "Only verified brand representatives can access this dashboard.",
        },
        { status: 403 }
      );
    }

    const representative =
      await prisma.brandRepresentative.findFirst({
        where: {
          userId,
          status: "VERIFIED",
        },
        include: {
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
        },
      });

    if (!representative) {
      return NextResponse.json(
        {
          error:
            "No verified brand representative account was found.",
        },
        { status: 403 }
      );
    }

    const complaints =
      await prisma.complaint.findMany({
        where: {
          brandId: representative.brandId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          complaintNumber: true,
          title: true,
          description: true,

          incidentDate: true,
          purchaseDate: true,

          retailer: true,
          purchaseCity: true,
          purchaseState: true,
          purchaseCountry: true,

          issueCategory: true,
          severity: true,
          desiredResolution: true,

          isAnonymous: true,
          displayName: true,

          status: true,
          moderationNote: true,
          publishedAt: true,
          resolvedAt: true,
          closedAt: true,

          createdAt: true,
          updatedAt: true,

          product: {
            select: {
              id: true,
              name: true,
              type: true,
              category: true,
              modelName: true,
              modelNumber: true,
              imageUrl: true,
            },
          },

          comments: {
            where: {
              status: "PUBLISHED",
            },
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              content: true,
              createdAt: true,
              updatedAt: true,

              user: {
                select: {
                  id: true,
                  displayName: true,
                },
              },

              brandRepresentative: {
                select: {
                  id: true,
                  jobTitle: true,
                  companyName: true,
                },
              },
            },
          },

          votes: {
            select: {
              id: true,
            },
          },

          statusHistory: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              status: true,
              note: true,
              createdAt: true,

              brandRep: {
                select: {
                  id: true,
                  jobTitle: true,
                  companyName: true,
                },
              },

              changedBy: {
                select: {
                  id: true,
                  displayName: true,
                  role: true,
                },
              },
            },
          },
        },
      });

    const stats = {
      totalComplaints: complaints.length,

      pendingReview: complaints.filter(
        (complaint) =>
          complaint.status === "UNDER_REVIEW"
      ).length,

      published: complaints.filter(
        (complaint) =>
          complaint.status === "PUBLISHED"
      ).length,

      acknowledged: complaints.filter(
        (complaint) =>
          complaint.status === "ACKNOWLEDGED"
      ).length,

      inProgress: complaints.filter(
        (complaint) =>
          complaint.status === "IN_PROGRESS"
      ).length,

      resolved: complaints.filter(
        (complaint) =>
          complaint.status === "RESOLVED"
      ).length,

      closed: complaints.filter(
        (complaint) =>
          complaint.status === "CLOSED"
      ).length,

      disputed: complaints.filter(
        (complaint) =>
          complaint.status === "DISPUTED"
      ).length,
    };

    return NextResponse.json(
      {
        success: true,

        representative: {
          id: representative.id,
          userId: representative.userId,
          companyName: representative.companyName,
          workEmail: representative.workEmail,
          jobTitle: representative.jobTitle,
          status: representative.status,
        },

        brand: representative.brand,

        stats,

        complaints: complaints.map(
          (complaint) => ({
            ...complaint,

            voteCount: complaint.votes.length,

            votes: undefined,
          })
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Brand dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load brand dashboard.",
      },
      { status: 500 }
    );
  }
}