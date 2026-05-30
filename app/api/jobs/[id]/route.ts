import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getUserLabel } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const job = await prisma.jobRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, displayName: true, trustStars: true, reportsCount: true } },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...job,
    createdAt: job.createdAt.toISOString(),
    expiresAt: job.expiresAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    user: { ...job.user, label: getUserLabel(job.user.trustStars) },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const job = await prisma.jobRequest.findUnique({ where: { id } });

  if (!job) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (job.userId !== auth.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { status } = body;

  const validTransitions: Record<string, string[]> = {
    open: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
  };

  const allowed = validTransitions[job.status];
  if (!allowed || !allowed.includes(status)) {
    return NextResponse.json(
      { error: `No se puede cambiar de "${job.status}" a "${status}"` },
      { status: 400 }
    );
  }

  const updated = await prisma.jobRequest.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { id: true, displayName: true, trustStars: true, reportsCount: true } },
    },
  });

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    expiresAt: updated.expiresAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    user: { ...updated.user, label: getUserLabel(updated.user.trustStars) },
  });
}
