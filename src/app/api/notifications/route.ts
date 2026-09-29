import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    const userId = session?.user?.id;

    if (!session?.user || !userId) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        select: {
          id: true,
          complaintId: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      });

    const unreadCount =
      notifications.filter(
        (notification) => !notification.isRead
      ).length;

    return NextResponse.json(
      {
        success: true,
        notifications,
        unreadCount,
        total: notifications.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Notification fetch error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const session = await auth();

    const userId = session?.user?.id;

    if (!session?.user || !userId) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const notificationId =
      typeof body.notificationId === "string"
        ? body.notificationId.trim()
        : "";

    const markAll =
      body.markAll === true;

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message:
            "All notifications marked as read.",
        },
        { status: 200 }
      );
    }

    if (!notificationId) {
      return NextResponse.json(
        {
          error:
            "Notification ID is required.",
        },
        { status: 400 }
      );
    }

    const notification =
      await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          error: "Notification not found.",
        },
        { status: 404 }
      );
    }

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
        select: {
          id: true,
          complaintId: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Notification marked as read.",
        notification: updatedNotification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Notification update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update notification.",
      },
      { status: 500 }
    );
  }
}