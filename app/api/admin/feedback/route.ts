import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const feedbacks = await prisma.appFeedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      userId: true,
      email: true,
      type: true,
      message: true,
      pageUrl: true,
      userAgent: true,
      status: true,
      adminNotes: true,
      createdAt: true,
      resolvedAt: true,
      user: {
        select: {
          displayName: true,
          trustStars: true,
        },
      },
    },
  });

  return NextResponse.json(feedbacks);
}
