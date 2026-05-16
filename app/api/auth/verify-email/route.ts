import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validations";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email ya verificado" }, { status: 400 });
  }

  if (
    user.verificationCode !== code ||
    !user.verificationExpiresAt ||
    user.verificationExpiresAt < new Date()
  ) {
    return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
      lastLoginAt: new Date(),
    },
  });

  const token = await signToken(user.id);
  const response = NextResponse.json({ ok: true, message: "Email verificado" });
  return setAuthCookie(response, token);
}
