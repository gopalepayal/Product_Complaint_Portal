import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const REPORT_REASONS = [
  "SPAM",
  "ABUSIVE_CONTENT",
  "FALSE_OR_MISLEADING",
  "PERSONAL_INFORMATION",
  "DEFAMATION",
  "OTHER",
] as const;

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session?.user || !userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id: commentId } = await context.params;

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim().toUpperCase()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (
      !REPORT_REASONS.includes(
        reason as (typeof REPORT_REASONS)[number]
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid report reason.",
          allowedReasons: REPORT_REASONS,
        },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        {
          error:
            "Report description must not exceed 1000 characters.",
        },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        complaintId: true,
        userId: true,
        status: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    if (comment.status === "REJECTED") {
      return NextResponse.json(
        {
          error: "This comment cannot be reported.",
        },
        { status: 400 }
      );
    }

    if (comment.userId === userId) {
      return NextResponse.json(
        {
          error: "You cannot report your own comment.",
        },
        { status: 400 }
      );
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        commentId,
        userId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          success: true,
          alreadyReported: true,
          reportId: existingReport.id,
          reportStatus: existingReport.status,
          message:
            "You have already reported this comment.",
        },
        { status: 200 }
      );
    }

    const report = await prisma.report.create({
      data: {
        commentId,
        userId,
        reason,
        description: description || null,
        status: "PENDING",
      },
      select: {
        id: true,
        commentId: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        alreadyReported: false,
        message:
          "Your comment report has been submitted for review.",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Comment report error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit comment report.",
      },
      { status: 500 }
    );
  }
}