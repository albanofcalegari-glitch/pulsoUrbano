import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import {
  verifyPassword,
  signToken,
  setAuthCookie,
  generateVerificationCode,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  if (user.isBlocked) {
    return NextResponse.json({ error: "Tu cuenta está restringida." }, { status: 403 });
  }

  if (!user.emailVerified) {
    const code = generateVerificationCode();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    await sendVerificationEmail(email.toLowerCase(), code);
    return NextResponse.json({
      ok: true,
      requiresVerification: true,
      message: "Verificá tu email. Te enviamos un nuevo código.",
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await signToken(user.id);
  const response = NextResponse.json({ ok: true });
  return setAuthCookie(response, token);
}
