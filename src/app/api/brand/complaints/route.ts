import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ComplaintAction =
  | "ACKNOWLEDGE"
  | "IN_PROGRESS"
  | "RESOLVE"
  | "RESPOND";

const actionStatusMap: Record<
  Exclude<ComplaintAction, "RESPOND">,
  "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED"
> = {
  ACKNOWLEDGE: "ACKNOWLEDGED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVE: "RESOLVED",
};

export async function PATCH(request: NextRequest) {
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
            "Only brand representatives can manage complaints.",
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
        select: {
          id: true,
          userId: true,
          brandId: true,
          companyName: true,
          workEmail: true,
          jobTitle: true,
          brand: {
            select: {
              id: true,
              name: true,
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

    const body = await request.json();

    const complaintId =
      typeof body.complaintId === "string"
        ? body.complaintId.trim()
        : "";

    const action =
      typeof body.action === "string"
        ? body.action.toUpperCase()
        : "";

    const response =
      typeof body.response === "string"
        ? body.response.trim()
        : "";

    const note =
      typeof body.note === "string"
        ? body.note.trim()
        : "";

    if (!complaintId) {
      return NextResponse.json(
        {
          error: "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      ![
        "ACKNOWLEDGE",
        "IN_PROGRESS",
        "RESOLVE",
        "RESPOND",
      ].includes(action)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid action. Use ACKNOWLEDGE, IN_PROGRESS, RESOLVE, or RESPOND.",
        },
        { status: 400 }
      );
    }

    if (
      action === "RESPOND" &&
      !response
    ) {
      return NextResponse.json(
        {
          error:
            "Response message is required.",
        },
        { status: 400 }
      );
    }

    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: complaintId,
        },
        select: {
          id: true,
          complaintNumber: true,
          title: true,
          status: true,
          brandId: true,
          consumerId: true,
        },
      });

    if (!complaint) {
      return NextResponse.json(
        {
          error: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    if (
      complaint.brandId !== representative.brandId
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to manage this complaint.",
        },
        { status: 403 }
      );
    }

    if (
      complaint.status === "REJECTED" ||
      complaint.status === "CLOSED"
    ) {
      return NextResponse.json(
        {
          error:
            "This complaint can no longer be modified by the brand representative.",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "RESPOND") {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const comment =
              await tx.comment.create({
                data: {
                  complaintId:
                    complaint.id,
                  userId,
                  brandRepresentativeId:
                    representative.id,
                  content: response,
                  status: "PUBLISHED",
                },
                select: {
                  id: true,
                  content: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              });

            if (complaint.consumerId) {
              await tx.notification.create({
                data: {
                  userId:
                    complaint.consumerId,
                  complaintId:
                    complaint.id,
                  title:
                    "Brand Response Received",
                  message:
                    `${representative.brand.name} has responded to complaint ${complaint.complaintNumber}.`,
                },
              });
            }

            return comment;
          }
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "Brand response posted successfully.",
          action,
          complaintId:
            complaint.id,
          complaintNumber:
            complaint.complaintNumber,
          brand: representative.brand,
          comment: result,
        },
        { status: 200 }
      );
    }

    const newStatus =
      actionStatusMap[
        action as Exclude<
          ComplaintAction,
          "RESPOND"
        >
      ];

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedComplaint =
            await tx.complaint.update({
              where: {
                id: complaint.id,
              },
              data: {
                status: newStatus,
                resolvedAt:
                  newStatus === "RESOLVED"
                    ? now
                    : undefined,
              },
              select: {
                id: true,
                complaintNumber: true,
                title: true,
                status: true,
                resolvedAt: true,
                updatedAt: true,
              },
            });

          await tx.statusHistory.create({
            data: {
              complaintId:
                complaint.id,
              status: newStatus,
              note:
                note ||
                `Status updated by ${representative.brand.name} brand representative.`,
              changedById: userId,
              brandRepId:
                representative.id,
            },
          });

          if (complaint.consumerId) {
            await tx.notification.create({
              data: {
                userId:
                  complaint.consumerId,
                complaintId:
                  complaint.id,
                title:
                  newStatus === "ACKNOWLEDGED"
                    ? "Complaint Acknowledged"
                    : newStatus === "IN_PROGRESS"
                      ? "Complaint In Progress"
                      : "Complaint Resolved",

                message:
                  `${representative.brand.name} has updated complaint ${complaint.complaintNumber} to ${newStatus.replaceAll("_", " ").toLowerCase()}.`,
              },
            });
          }

          return updatedComplaint;
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          newStatus === "ACKNOWLEDGED"
            ? "Complaint acknowledged successfully."
            : newStatus === "IN_PROGRESS"
              ? "Complaint marked as in progress."
              : "Complaint marked as resolved.",

        action,

        complaint: result,

        brand: representative.brand,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Brand complaint action error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update complaint.",
      },
      { status: 500 }
    );
  }
}