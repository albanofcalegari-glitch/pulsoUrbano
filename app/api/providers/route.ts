import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createProviderSchema } from "@/lib/validations";
import { getUserLabel } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const skill = searchParams.get("skill");

  const where: Record<string, unknown> = {
    isActive: true,
    moderationStatus: "approved",
  };

  if (skill) {
    where.skills = { has: skill };
  }

  const providers = await prisma.serviceProvider.findMany({
    where,
    orderBy: { averageRating: "desc" },
    take: 100,
    include: {
      user: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  const mapped = providers.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    phone: null,
    user: { ...p.user, label: getUserLabel(p.user.trustStars) },
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const existing = await prisma.serviceProvider.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya tenés un perfil de proveedor" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = createProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const provider = await prisma.serviceProvider.create({
    data: {
      userId: user.id,
      bio: parsed.data.bio,
      phone: parsed.data.phone,
      skills: parsed.data.skills,
      photoUrls: parsed.data.photoUrls || [],
      moderationStatus: "approved",
    },
    include: {
      user: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  return NextResponse.json(
    {
      ...provider,
      createdAt: provider.createdAt.toISOString(),
      updatedAt: provider.updatedAt.toISOString(),
      user: { ...provider.user, label: getUserLabel(provider.user.trustStars) },
    },
    { status: 201 }
  );
}
