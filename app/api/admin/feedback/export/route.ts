import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function escapeCSV(val: string | null | undefined): string {
  if (!val) return "";
  const s = val.replace(/"/g, '""');
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
}

function maskEmail(email: string | null): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const feedbacks = await prisma.appFeedback.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      type: true,
      status: true,
      message: true,
      pageUrl: true,
      email: true,
      adminNotes: true,
      user: { select: { displayName: true } },
    },
  });

  const header = "created_at,type,status,message,page_url,user_or_email,admin_notes";
  const rows = feedbacks.map((f) => {
    const userLabel = f.user?.displayName || maskEmail(f.email) || "anónimo";
    return [
      f.createdAt.toISOString(),
      f.type,
      f.status,
      escapeCSV(f.message),
      escapeCSV(f.pageUrl),
      escapeCSV(userLabel),
      escapeCSV(f.adminNotes),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
