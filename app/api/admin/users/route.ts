import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const search = req.nextUrl.searchParams.get("search") || "";

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { displayName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      trustStars: true,
      trustScore: true,
      reportsCount: true,
      confirmedReportsCount: true,
      rejectedReportsCount: true,
      flagsReceivedCount: true,
      isBlocked: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return NextResponse.json(users);
}
