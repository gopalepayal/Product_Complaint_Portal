import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Generate notice number SAF-YYYY-XXX
    const count = await (prisma as any).safetyNotice.count();
    const year = new Date().getFullYear();
    const noticeNumber = `SAF-${year}-${String(count + 1).padStart(3, '0')}`;

    const notice = await (prisma as any).safetyNotice.create({
      data: {
        noticeNumber,
        productName: data.productName,
        productId: data.productId || null,
        batchNumber: data.batchNumber || null,
        issueType: data.issueType,
        severity: data.severity,
        affectedArea: data.affectedArea || null,
        consumerAction: data.consumerAction,
        status: data.status || "ACTIVE",
        publishedAt: data.status === "ACTIVE" ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true, notice });
  } catch (error: any) {
    console.error("Error creating safety notice:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    
    const { id, ...updateData } = data;
    
    if (updateData.status === "ACTIVE" && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const notice = await (prisma as any).safetyNotice.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, notice });
  } catch (error: any) {
    console.error("Error updating safety notice:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productName = searchParams.get('productName');
    const batchNumber = searchParams.get('batchNumber');

    const where: any = {};
    if (productName) where.productName = { contains: productName, mode: 'insensitive' };
    if (batchNumber) where.batchNumber = batchNumber;

    const notices = await (prisma as any).safetyNotice.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ success: true, notices });
  } catch (error: any) {
    console.error('Error fetching safety notices:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
