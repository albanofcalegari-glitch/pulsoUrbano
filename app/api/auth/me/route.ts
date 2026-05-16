import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      role: user.role,
      trustScore: user.trustScore,
      trustStars: user.trustStars,
      reportsCount: user.reportsCount,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    },
  });
}
