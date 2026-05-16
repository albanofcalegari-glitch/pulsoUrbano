import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getUserLabel } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
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

  const mapped = reports.map((r) => ({
    ...r,
    user: {
      ...r.user,
      label: getUserLabel(r.user.trustStars),
    },
  }));

  return NextResponse.json(mapped);
}
