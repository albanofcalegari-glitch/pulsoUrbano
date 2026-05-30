import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserLabel } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reviews = await prisma.jobReview.findMany({
    where: { jobRequestId: id },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  const mapped = reviews.map((r) => ({
    id: r.id,
    jobRequestId: r.jobRequestId,
    authorId: r.authorId,
    targetId: r.targetId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    author: { ...r.author, label: getUserLabel(r.author.trustStars) },
  }));

  return NextResponse.json(mapped);
}
