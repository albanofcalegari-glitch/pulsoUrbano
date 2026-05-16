import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const [
    totalUsers,
    totalReports,
    activeReports,
    pendingFeedback,
    blockedUsers,
    reportsByCategory,
    reportsByStatus,
    recentUsers,
    topReporters,
    totalConfirmations,
    totalFlags,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: { in: ["seen", "confirmed"] } } }),
    prisma.appFeedback.count({ where: { status: "new" } }),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.report.groupBy({ by: ["category"], _count: true }),
    prisma.report.groupBy({ by: ["status"], _count: true }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, email: true, displayName: true, trustStars: true,
        reportsCount: true, isBlocked: true, createdAt: true, lastLoginAt: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { reportsCount: "desc" },
      take: 5,
      where: { reportsCount: { gt: 0 } },
      select: { id: true, displayName: true, email: true, trustStars: true, reportsCount: true },
    }),
    prisma.reportConfirmation.count(),
    prisma.reportFlag.count(),
  ]);

  return NextResponse.json({
    stats: { totalUsers, totalReports, activeReports, pendingFeedback, blockedUsers, totalConfirmations, totalFlags },
    reportsByCategory: reportsByCategory.map((r) => ({ category: r.category, count: r._count })),
    reportsByStatus: reportsByStatus.map((r) => ({ status: r.status, count: r._count })),
    recentUsers,
    topReporters,
  });
}
