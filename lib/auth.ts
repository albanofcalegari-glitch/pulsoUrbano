import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-secret-change-in-production")
) {
  throw new Error("JWT_SECRET must be set in production");
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

const COOKIE_NAME = "pu_token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  role: string;
  trustScore: number;
  trustStars: number;
  reportsCount: number;
  confirmedReportsCount: number;
  rejectedReportsCount: number;
  flagsReceivedCount: number;
  isBlocked: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const userId = await verifyToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function requireAuth(req: NextRequest): Promise<
  | { user: AuthUser; error: null }
  | { user: null; error: NextResponse }
> {
  const user = await getAuthUser(req);

  if (!user) {
    return { user: null, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  if (user.isBlocked) {
    return { user: null, error: NextResponse.json({ error: "Tu cuenta está restringida." }, { status: 403 }) };
  }

  return { user, error: null };
}

export async function requireAdmin(req: NextRequest): Promise<
  | { user: AuthUser; error: null }
  | { user: null; error: NextResponse }
> {
  const result = await requireAuth(req);
  if (result.error) return result;

  if (result.user.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) };
  }

  return result;
}
