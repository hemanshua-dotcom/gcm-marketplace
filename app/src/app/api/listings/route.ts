import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const publisherId = (user as { publisherId?: string | null }).publisherId;
  if (!publisherId) return NextResponse.json({ error: "No publisher linked to this account" }, { status: 400 });

  const body = await req.json();
  const { name, shortDescription, description, category, type, tags, logoUrl, pricingType, price, unitPrice, unit, billingPeriod, planName, planDescription, planFeatures } = body;

  if (!name || !shortDescription || !category || !type || !pricingType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const categoryRecord = await db.category.findUnique({ where: { slug: category } });
  if (!categoryRecord) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  // Generate a unique slug
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = baseSlug;
  let i = 1;
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const product = await db.product.create({
    data: {
      name,
      slug,
      shortDescription,
      description: description || shortDescription,
      type,
      categoryId: categoryRecord.id,
      publisherId,
      logoUrl: logoUrl || "",
      screenshots: JSON.stringify([]),
      featured: false,
      verified: false,          // pending review
      rating: 0,
      reviewCount: 0,
      deployCount: 0,
      tags: JSON.stringify(tags ?? []),
      metadata: JSON.stringify({}),
    },
  });

  // Create pricing plan
  await db.pricingPlan.create({
    data: {
      productId: product.id,
      name: planName || "Standard",
      type: pricingType,
      price: pricingType === "SUBSCRIPTION" ? (parseFloat(price) || null) : null,
      unitPrice: pricingType === "USAGE_BASED" ? (parseFloat(unitPrice) || null) : null,
      unit: pricingType === "USAGE_BASED" ? (unit || null) : null,
      billingPeriod: pricingType === "SUBSCRIPTION" ? billingPeriod : null,
      description: planDescription || "",
      features: JSON.stringify(planFeatures?.filter(Boolean) ?? []),
      highlighted: true,
    },
  });

  return NextResponse.json({ productId: product.id, slug });
}
