import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  if (user.role === "admin") {
    return NextResponse.json({ error: "No se puede bloquear a un admin" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id },
    data: { isBlocked: true },
  });

  return NextResponse.json({ ok: true });
}
