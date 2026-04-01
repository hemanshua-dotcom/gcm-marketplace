"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireSellerOwnership(productId: string) {
  const user = await getSession();
  if (!user || user.role === "BUYER") throw new Error("Unauthorized");
  const publisherId = (user as { publisherId?: string }).publisherId;
  if (!publisherId) throw new Error("No publisher linked");
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.publisherId !== publisherId) throw new Error("Forbidden");
  return product;
}

export async function deleteSellerListing(productId: string) {
  await requireSellerOwnership(productId);
  await db.pricingPlan.deleteMany({ where: { productId } });
  await db.review.deleteMany({ where: { productId } });
  await db.order.deleteMany({ where: { productId } });
  await db.product.delete({ where: { id: productId } });
  revalidatePath("/seller");
  revalidatePath("/seller/listings");
}

export async function updateSellerListing(productId: string, data: {
  name: string;
  shortDescription: string;
  description: string;
}) {
  await requireSellerOwnership(productId);
  await db.product.update({ where: { id: productId }, data });
  revalidatePath("/seller");
  revalidatePath("/seller/listings");
}
