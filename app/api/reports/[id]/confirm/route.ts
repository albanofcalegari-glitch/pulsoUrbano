import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { CONFIRMATION_EXTENSION_HOURS } from "@/lib/constants";
import { calculateTrustScore, getStarsFromScore } from "@/lib/trust";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const user = auth.user;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Aviso no encontrado" }, { status: 404 });
  }

  if (report.userId === user.id) {
    return NextResponse.json({ error: "No podés confirmar tu propio aviso" }, { status: 400 });
  }

  const existing = await prisma.reportConfirmation.findUnique({
    where: { reportId_userId: { reportId: id, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya confirmaste este aviso" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.reportConfirmation.create({
      data: { reportId: id, userId: user.id, ipAddress: ip },
    }),
    prisma.report.update({
      where: { id },
      data: {
        confirmationCount: { increment: 1 },
        lastConfirmedAt: new Date(),
        expiresAt: new Date(
          Math.max(
            report.expiresAt.getTime(),
            Date.now() + CONFIRMATION_EXTENSION_HOURS * 60 * 60 * 1000
          )
        ),
      },
    }),
  ]);

  // Actualizar trust del dueño del reporte
  const reportOwner = await prisma.user.findUnique({ where: { id: report.userId } });
  if (reportOwner) {
    const newCount = reportOwner.confirmedReportsCount + 1;
    const newScore = calculateTrustScore({ ...reportOwner, confirmedReportsCount: newCount });
    const newStars = getStarsFromScore(newScore);
    await prisma.user.update({
      where: { id: report.userId },
      data: {
        confirmedReportsCount: newCount,
        trustScore: newScore,
        trustStars: newStars,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
