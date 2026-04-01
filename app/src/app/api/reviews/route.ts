import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, rating, title, body } = await req.json();
  if (!productId || !rating || !title || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  // Check for existing review
  const existing = await db.review.findFirst({ where: { productId, userId: user.id } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const [review, product] = await Promise.all([
    db.review.create({ data: { productId, userId: user.id, rating, title, body } }),
    db.product.findUnique({ where: { id: productId }, select: { rating: true, reviewCount: true } }),
  ]);

  if (product) {
    const newCount = product.reviewCount + 1;
    const newRating = (product.rating * product.reviewCount + rating) / newCount;
    await db.product.update({
      where: { id: productId },
      data: { rating: Math.round(newRating * 10) / 10, reviewCount: newCount },
    });
  }

  return NextResponse.json({ reviewId: review.id });
}
