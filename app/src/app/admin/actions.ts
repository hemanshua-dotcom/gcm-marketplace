"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await db.pricingPlan.deleteMany({ where: { productId } });
  await db.review.deleteMany({ where: { productId } });
  await db.order.deleteMany({ where: { productId } });
  await db.product.delete({ where: { id: productId } });
  revalidatePath("/admin");
}

export async function setProductVerified(productId: string, verified: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id: productId }, data: { verified } });
  revalidatePath("/admin");
  revalidatePath("/products", "layout");
  revalidatePath("/seller", "layout");
  revalidatePath("/seller/listings", "layout");
}

export async function updateProduct(productId: string, data: {
  name: string;
  shortDescription: string;
  featured: boolean;
  verified: boolean;
}) {
  await requireAdmin();
  await db.product.update({
    where: { id: productId },
    data,
  });
  revalidatePath("/admin");
  revalidatePath("/products", "layout");
  revalidatePath("/seller", "layout");
  revalidatePath("/seller/listings", "layout");
}
