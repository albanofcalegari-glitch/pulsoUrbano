import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserLabel } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    select: {
      id: true,
      category: true,
      latitude: true,
      longitude: true,
      status: true,
      comment: true,
      photoUrl: true,
      locationValidation: true,
      confidenceScore: true,
      confirmationCount: true,
      removalCount: true,
      flagCount: true,
      moderationStatus: true,
      createdAt: true,
      expiresAt: true,
      lastConfirmedAt: true,
      user: {
        select: {
          id: true,
          displayName: true,
          trustStars: true,
          reportsCount: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Aviso no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...report,
    user: {
      ...report.user,
      label: getUserLabel(report.user.trustStars),
    },
  });
}
