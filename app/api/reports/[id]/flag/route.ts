import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { flagReportSchema } from "@/lib/validations";
import { FLAGS_THRESHOLD, AUTO_BLOCK_FLAGS_THRESHOLD } from "@/lib/constants";
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
    return NextResponse.json({ error: "No podés señalar tu propio aviso" }, { status: 400 });
  }

  const existing = await prisma.reportFlag.findUnique({
    where: { reportId_userId: { reportId: id, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya señalaste este aviso" }, { status: 409 });
  }

  let body: unknown = {};
  try { body = await req.json(); } catch { /* vacío OK */ }
  const parsed = flagReportSchema.safeParse(body);

  const newFlagCount = report.flagCount + 1;
  const shouldReview = newFlagCount >= FLAGS_THRESHOLD;

  await prisma.$transaction([
    prisma.reportFlag.create({
      data: {
        reportId: id,
        userId: user.id,
        ipAddress: ip,
        reason: parsed.success ? parsed.data.reason || null : null,
      },
    }),
    prisma.report.update({
      where: { id },
      data: {
        flagCount: { increment: 1 },
        ...(shouldReview ? { status: "under_review" } : {}),
      },
    }),
  ]);

  // Actualizar trust del dueño del reporte y evaluar bloqueo automático
  const reportOwner = await prisma.user.findUnique({ where: { id: report.userId } });
  if (reportOwner) {
    const newFlags = reportOwner.flagsReceivedCount + 1;
    const newScore = calculateTrustScore({ ...reportOwner, flagsReceivedCount: newFlags });
    const newStars = getStarsFromScore(newScore);
    const shouldBlock = newFlags >= AUTO_BLOCK_FLAGS_THRESHOLD;

    await prisma.user.update({
      where: { id: report.userId },
      data: {
        flagsReceivedCount: newFlags,
        trustScore: newScore,
        trustStars: newStars,
        ...(shouldBlock ? { isBlocked: true } : {}),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
