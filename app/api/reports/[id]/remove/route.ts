import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { REMOVALS_THRESHOLD } from "@/lib/constants";

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

  const existing = await prisma.reportRemoval.findUnique({
    where: { reportId_userId: { reportId: id, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya marcaste este aviso" }, { status: 409 });
  }

  const newCount = report.removalCount + 1;
  const shouldRemove = newCount >= REMOVALS_THRESHOLD;

  await prisma.$transaction([
    prisma.reportRemoval.create({
      data: { reportId: id, userId: user.id, ipAddress: ip },
    }),
    prisma.report.update({
      where: { id },
      data: {
        removalCount: { increment: 1 },
        ...(shouldRemove ? { status: "removed" } : {}),
      },
    }),
  ]);

  return NextResponse.json({ ok: true, removed: shouldRemove });
}
