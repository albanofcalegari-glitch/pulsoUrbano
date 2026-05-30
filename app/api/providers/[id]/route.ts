import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserLabel } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const reviews = await prisma.jobReview.findMany({
    where: { targetId: provider.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      author: { select: { id: true, displayName: true, trustStars: true, reportsCount: true } },
    },
  });

  return NextResponse.json({
    ...provider,
    phone: null,
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString(),
    user: { ...provider.user, label: getUserLabel(provider.user.trustStars) },
    reviews: reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      author: { ...r.author, label: getUserLabel(r.author.trustStars) },
    })),
  });
}
