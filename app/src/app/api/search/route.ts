import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { shortDescription: { contains: q } },
        { tags: { contains: q } },
      ],
    },
    include: { publisher: true, category: true },
    take: 8,
    orderBy: { deployCount: "desc" },
  });

  return NextResponse.json({
    results: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      type: p.type,
      category: p.category.name,
      publisher: p.publisher.name,
    })),
  });
}
