import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { calculateTrustScore, getStarsFromScore } from "@/lib/trust";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  let body: { action?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const actionMap: Record<string, { status?: string; moderationStatus?: string }> = {
    approve: { moderationStatus: "approved" },
    hide: { status: "hidden", moderationStatus: "hidden" },
    spam: { status: "hidden", moderationStatus: "spam" },
    remove: { status: "removed" },
  };

  const updates = actionMap[body.action || ""];
  if (!updates) return NextResponse.json({ error: "Acción inválida" }, { status: 400 });

  await prisma.report.update({ where: { id }, data: updates });

  // Si marcó como spam, penalizar al usuario
  if (body.action === "spam") {
    const owner = await prisma.user.findUnique({ where: { id: report.userId } });
    if (owner) {
      const newRejected = owner.rejectedReportsCount + 1;
      const newScore = calculateTrustScore({ ...owner, rejectedReportsCount: newRejected });
      await prisma.user.update({
        where: { id: report.userId },
        data: {
          rejectedReportsCount: newRejected,
          trustScore: newScore,
          trustStars: getStarsFromScore(newScore),
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
