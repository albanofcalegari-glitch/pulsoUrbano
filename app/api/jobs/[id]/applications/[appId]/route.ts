import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { id, appId } = await params;

  const job = await prisma.jobRequest.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (job.userId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id: appId },
  });
  if (!application || application.jobRequestId !== id) {
    return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });
  }

  if (application.status !== "pending") {
    return NextResponse.json({ error: "Esta postulación ya fue procesada" }, { status: 400 });
  }

  const body = await req.json();
  const { status } = body;

  if (status !== "accepted" && status !== "rejected") {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  if (status === "accepted") {
    await prisma.$transaction([
      prisma.jobApplication.update({
        where: { id: appId },
        data: { status: "accepted" },
      }),
      prisma.jobApplication.updateMany({
        where: { jobRequestId: id, id: { not: appId }, status: "pending" },
        data: { status: "rejected" },
      }),
      prisma.jobRequest.update({
        where: { id },
        data: { status: "in_progress", selectedProviderId: application.providerId },
      }),
    ]);
  } else {
    await prisma.jobApplication.update({
      where: { id: appId },
      data: { status: "rejected" },
    });
  }

  return NextResponse.json({ success: true, status });
}
