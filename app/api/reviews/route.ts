import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations";
import { getUserLabel } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json();
  const { jobRequestId, ...reviewData } = body;

  if (!jobRequestId) {
    return NextResponse.json({ error: "jobRequestId requerido" }, { status: 400 });
  }

  const parsed = createReviewSchema.safeParse(reviewData);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const job = await prisma.jobRequest.findUnique({
    where: { id: jobRequestId },
    include: {
      applications: { where: { status: "accepted" } },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (job.status !== "completed") {
    return NextResponse.json({ error: "Solo podés dejar reseña en trabajos completados" }, { status: 400 });
  }

  const acceptedApp = job.applications[0];
  if (!acceptedApp) {
    return NextResponse.json({ error: "No hay proveedor asignado" }, { status: 400 });
  }

  let targetId: string;
  if (user.id === job.userId) {
    targetId = acceptedApp.userId;
  } else if (user.id === acceptedApp.userId) {
    targetId = job.userId;
  } else {
    return NextResponse.json({ error: "No participás en este trabajo" }, { status: 403 });
  }

  const existing = await prisma.jobReview.findUnique({
    where: { jobRequestId_authorId: { jobRequestId, authorId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya dejaste una reseña en este trabajo" }, { status: 409 });
  }

  const review = await prisma.jobReview.create({
    data: {
      jobRequestId,
      authorId: user.id,
      targetId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    include: {
      author: {
        select: { id: true, displayName: true, trustStars: true, reportsCount: true },
      },
    },
  });

  if (user.id === job.userId) {
    const providerUser = acceptedApp.userId;
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: providerUser },
    });
    if (provider) {
      const allReviews = await prisma.jobReview.findMany({
        where: { targetId: providerUser },
        select: { rating: true },
      });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: {
          averageRating: Math.round(avg * 10) / 10,
          totalReviews: allReviews.length,
          totalJobs: { increment: 1 },
        },
      });
    }
  }

  return NextResponse.json(
    {
      id: review.id,
      jobRequestId: review.jobRequestId,
      authorId: review.authorId,
      targetId: review.targetId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      author: { ...review.author, label: getUserLabel(review.author.trustStars) },
    },
    { status: 201 }
  );
}
