import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { updateProviderSchema } from "@/lib/validations";
import { getUserLabel } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: auth.user.id },
    include: {
      user: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "No tenés perfil de proveedor" }, { status: 404 });
  }

  return NextResponse.json({
    ...provider,
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString(),
    user: { ...provider.user, label: getUserLabel(provider.user.trustStars) },
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: auth.user.id },
  });

  if (!provider) {
    return NextResponse.json({ error: "No tenés perfil de proveedor" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await prisma.serviceProvider.update({
    where: { id: provider.id },
    data: parsed.data,
    include: {
      user: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    user: { ...updated.user, label: getUserLabel(updated.user.trustStars) },
  });
}
