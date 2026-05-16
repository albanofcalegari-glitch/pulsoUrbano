import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createReportSchema } from "@/lib/validations";
import { validateLocation } from "@/lib/location";
import { calculateConfidence } from "@/lib/confidence";
import {
  ACTIVE_STATUSES,
  EXPIRATION_HOURS,
  MAX_REPORTS_PER_DAY_NEW_USER,
  MAX_REPORTS_PER_DAY_TRUSTED,
  NEW_USER_TRUST_THRESHOLD,
  CATEGORY_GROUP_MEMBERS,
} from "@/lib/constants";
import { getUserLabel } from "@/lib/utils";
import type { CategoryGroup } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const categoryGroup = searchParams.get("categoryGroup") as CategoryGroup | null;
  const north = searchParams.get("north");
  const south = searchParams.get("south");
  const east = searchParams.get("east");
  const west = searchParams.get("west");

  const where: Record<string, unknown> = {
    status: { in: status ? [status] : ACTIVE_STATUSES },
    moderationStatus: { not: "hidden" },
    expiresAt: { gt: new Date() },
  };

  if (category) {
    where.category = category;
  } else if (categoryGroup && categoryGroup !== "all") {
    const members = CATEGORY_GROUP_MEMBERS[categoryGroup];
    if (members) {
      where.category = { in: members };
    }
  }

  if (north && south && east && west) {
    where.latitude = { gte: parseFloat(south), lte: parseFloat(north) };
    where.longitude = { gte: parseFloat(west), lte: parseFloat(east) };
  }

  const reports = await prisma.report.findMany({
    where,
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

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const user = auth.user;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayCount = await prisma.report.count({
    where: { userId: user.id, createdAt: { gt: oneDayAgo } },
  });

  const maxPerDay = user.trustStars >= NEW_USER_TRUST_THRESHOLD
    ? MAX_REPORTS_PER_DAY_TRUSTED
    : MAX_REPORTS_PER_DAY_NEW_USER;

  if (todayCount >= maxPerDay) {
    return NextResponse.json(
      { error: `Máximo ${maxPerDay} avisos por día. Intentá mañana.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { category, latitude, longitude, status, comment, photoUrl,
          reporterLatitude, reporterLongitude, locationAccuracyMeters } = parsed.data;

  const locationResult = validateLocation({
    reportLat: latitude,
    reportLng: longitude,
    reporterLat: reporterLatitude,
    reporterLng: reporterLongitude,
  });

  const confidence = calculateConfidence({
    hasPhoto: !!photoUrl,
    locationValidation: locationResult.status,
    userTrustStars: user.trustStars,
    confirmationCount: 0,
    flagCount: 0,
    removalCount: 0,
    hoursOld: 0,
  });

  const report = await prisma.report.create({
    data: {
      userId: user.id,
      category,
      latitude,
      longitude,
      reporterLatitude: reporterLatitude || null,
      reporterLongitude: reporterLongitude || null,
      locationAccuracyMeters: locationAccuracyMeters || null,
      distanceFromReportMeters: locationResult.distanceMeters,
      locationValidation: locationResult.status,
      status,
      comment: comment || null,
      photoUrl,
      confidenceScore: confidence,
      reporterIp: ip,
      expiresAt: new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { reportsCount: { increment: 1 } },
  });

  return NextResponse.json(report, { status: 201 });
}
