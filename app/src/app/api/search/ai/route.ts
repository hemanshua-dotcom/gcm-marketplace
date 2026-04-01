import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";

const PRICING_TO_PARAM: Record<string, string> = {
  FREE: "free",
  SUBSCRIPTION: "subscription",
  USAGE_BASED: "usage-based",
  BYOL: "byol",
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 5) return NextResponse.json({ error: "Query too short" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI search not configured" }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let parsed: {
    answer: string;
    category: string | null;
    type: string | null;
    pricing: string | null;
    searchTerms: string;
  };

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are a Google Cloud Marketplace search assistant. A user searched: "${q}"

Respond with JSON only (no markdown, no code fences):
{
  "answer": "1-2 sentence response explaining what you found for them",
  "category": "one of: ai-ml, security, devops, databases, networking, analytics, storage, business, infrastructure, dev-tools — or null",
  "type": "one of: SAAS, VM_IMAGE, KUBERNETES_APP, AI_MODEL, FOUNDATIONAL_MODEL, CONTAINER_IMAGE, API, DATASET, PROFESSIONAL_SERVICE — or null",
  "pricing": "one of: FREE, SUBSCRIPTION, USAGE_BASED, BYOL — or null",
  "searchTerms": "2-4 keyword search terms to find matching products"
}`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to interpret query" }, { status: 500 });
  }

  // Build DB query from AI interpretation
  const where: Record<string, unknown> = { verified: true };
  if (parsed.category) where.category = { slug: parsed.category };
  if (parsed.type) where.type = parsed.type;
  if (parsed.pricing) where.pricingPlans = { some: { type: parsed.pricing } };
  if (parsed.searchTerms) {
    where.OR = [
      { name: { contains: parsed.searchTerms, mode: "insensitive" } },
      { shortDescription: { contains: parsed.searchTerms, mode: "insensitive" } },
      { tags: { contains: parsed.searchTerms, mode: "insensitive" } },
    ];
  }

  const products = await db.product.findMany({
    where,
    include: { publisher: true, category: true },
    take: 5,
    orderBy: { deployCount: "desc" },
  });

  // Build browse URL
  const params = new URLSearchParams();
  if (parsed.category) params.set("category", parsed.category);
  if (parsed.type) params.set("type", parsed.type);
  if (parsed.pricing && PRICING_TO_PARAM[parsed.pricing]) {
    params.set("pricing", PRICING_TO_PARAM[parsed.pricing]);
  }
  if (parsed.searchTerms) params.set("search", parsed.searchTerms);

  return NextResponse.json({
    answer: parsed.answer,
    browseUrl: `/browse?${params.toString()}`,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      type: p.type,
      publisher: p.publisher.name,
    })),
  });
}
