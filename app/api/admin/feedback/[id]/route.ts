import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateFeedbackSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  const existing = await prisma.appFeedback.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Feedback no encontrado" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = updateFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { status, adminNotes } = parsed.data;

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (adminNotes !== undefined) data.adminNotes = adminNotes;
  if (status === "resolved") data.resolvedAt = new Date();

  const updated = await prisma.appFeedback.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
