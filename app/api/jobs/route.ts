import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createJobRequestSchema } from "@/lib/validations";
import { getUserLabel } from "@/lib/utils";
import {
  JOB_EXPIRATION_DAYS,
  MAX_JOBS_PER_DAY_NEW,
  MAX_JOBS_PER_DAY_TRUSTED,
  NEW_USER_TRUST_THRESHOLD,
} from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "open";
  const north = searchParams.get("north");
  const south = searchParams.get("south");
  const east = searchParams.get("east");
  const west = searchParams.get("west");

  const where: Record<string, unknown> = {
    status,
    moderationStatus: { not: "hidden" },
    expiresAt: { gt: new Date() },
  };

  if (category) where.category = category;

  if (north && south && east && west) {
    where.latitude = { gte: parseFloat(south), lte: parseFloat(north) };
    where.longitude = { gte: parseFloat(west), lte: parseFloat(east) };
  }

  const jobs = await prisma.jobRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      category: true,
      latitude: true,
      longitude: true,
      address: true,
      budgetMin: true,
      budgetMax: true,
      urgency: true,
      status: true,
      applicationsCount: true,
      selectedProviderId: true,
      createdAt: true,
      expiresAt: true,
      user: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  const mapped = jobs.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    expiresAt: j.expiresAt.toISOString(),
    user: { ...j.user, label: getUserLabel(j.user.trustStars) },
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json();
  const parsed = createJobRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const maxPerDay = user.trustStars >= NEW_USER_TRUST_THRESHOLD
    ? MAX_JOBS_PER_DAY_TRUSTED
    : MAX_JOBS_PER_DAY_NEW;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await prisma.jobRequest.count({
    where: { userId: user.id, createdAt: { gte: todayStart } },
  });

  if (todayCount >= maxPerDay) {
    return NextResponse.json(
      { error: `Límite diario alcanzado (${maxPerDay} pedidos por día)` },
      { status: 429 }
    );
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + JOB_EXPIRATION_DAYS);

  const job = await prisma.jobRequest.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address: parsed.data.address,
      budgetMin: parsed.data.budgetMin,
      budgetMax: parsed.data.budgetMax,
      urgency: parsed.data.urgency,
      expiresAt,
    },
    include: {
      user: { select: { id: true, displayName: true, trustStars: true, reportsCount: true } },
    },
  });

  return NextResponse.json(
    {
      ...job,
      createdAt: job.createdAt.toISOString(),
      expiresAt: job.expiresAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      user: { ...job.user, label: getUserLabel(job.user.trustStars) },
    },
    { status: 201 }
  );
}
