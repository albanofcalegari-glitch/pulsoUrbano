import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, getAuthUser } from "@/lib/auth";
import { createApplicationSchema } from "@/lib/validations";
import { getUserLabel } from "@/lib/utils";
import { MAX_APPLICATIONS_PER_JOB } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const job = await prisma.jobRequest.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const user = await getAuthUser(req);
  const isOwner = user?.id === job.userId;

  const applications = await prisma.jobApplication.findMany({
    where: { jobRequestId: id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        include: {
          user: {
            select: { id: true, displayName: true, trustStars: true, reportsCount: true },
          },
        },
      },
    },
  });

  const mapped = applications.map((a) => ({
    id: a.id,
    jobRequestId: a.jobRequestId,
    providerId: a.providerId,
    userId: a.userId,
    message: a.message,
    proposedPrice: a.proposedPrice,
    estimatedTime: a.estimatedTime,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    provider: {
      ...a.provider,
      createdAt: a.provider.createdAt.toISOString(),
      updatedAt: a.provider.updatedAt.toISOString(),
      phone: isOwner && a.status === "accepted" ? a.provider.phone : null,
      user: { ...a.provider.user, label: getUserLabel(a.provider.user.trustStars) },
    },
  }));

  return NextResponse.json(mapped);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { id } = await params;

  const job = await prisma.jobRequest.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (job.status !== "open") {
    return NextResponse.json({ error: "Este pedido ya no acepta postulaciones" }, { status: 400 });
  }

  if (job.userId === user.id) {
    return NextResponse.json({ error: "No podés postularte a tu propio pedido" }, { status: 400 });
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: user.id },
  });
  if (!provider) {
    return NextResponse.json(
      { error: "Necesitás crear tu perfil de proveedor primero" },
      { status: 400 }
    );
  }

  if (job.applicationsCount >= MAX_APPLICATIONS_PER_JOB) {
    return NextResponse.json({ error: "Este pedido alcanzó el máximo de postulaciones" }, { status: 400 });
  }

  const existing = await prisma.jobApplication.findUnique({
    where: { jobRequestId_providerId: { jobRequestId: id, providerId: provider.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya te postulaste a este pedido" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = createApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const [application] = await prisma.$transaction([
    prisma.jobApplication.create({
      data: {
        jobRequestId: id,
        providerId: provider.id,
        userId: user.id,
        message: parsed.data.message,
        proposedPrice: parsed.data.proposedPrice,
        estimatedTime: parsed.data.estimatedTime,
      },
      include: {
        provider: {
          include: {
            user: {
              select: { id: true, displayName: true, trustStars: true, reportsCount: true },
            },
          },
        },
      },
    }),
    prisma.jobRequest.update({
      where: { id },
      data: { applicationsCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(
    {
      id: application.id,
      jobRequestId: application.jobRequestId,
      providerId: application.providerId,
      userId: application.userId,
      message: application.message,
      proposedPrice: application.proposedPrice,
      estimatedTime: application.estimatedTime,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      provider: {
        ...application.provider,
        createdAt: application.provider.createdAt.toISOString(),
        updatedAt: application.provider.updatedAt.toISOString(),
        phone: null,
        user: { ...application.provider.user, label: getUserLabel(application.provider.user.trustStars) },
      },
    },
    { status: 201 }
  );
}
