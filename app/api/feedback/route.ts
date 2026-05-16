import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { createFeedbackSchema } from "@/lib/validations";

const MAX_FEEDBACK_PER_HOUR = 5;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.appFeedback.count({
    where: { ipAddress: ip, createdAt: { gt: oneHourAgo } },
  });
  if (recentCount >= MAX_FEEDBACK_PER_HOUR) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intentá de nuevo más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { type, message, email, pageUrl } = parsed.data;
  const userAgent = req.headers.get("user-agent") || null;

  const user = await getAuthUser(req);

  const feedback = await prisma.appFeedback.create({
    data: {
      userId: user?.id || null,
      email: user ? null : (email || null),
      type,
      message,
      pageUrl: pageUrl || null,
      userAgent,
      ipAddress: ip,
    },
  });

  return NextResponse.json({ id: feedback.id }, { status: 201 });
}
