import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, planId, planName, projectId, region, monthlyCost } = await req.json();

  if (!productId || !planId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [order] = await Promise.all([
    db.order.create({
      data: {
        userId: user.id,
        productId,
        planId,
        planName: planName ?? null,
        projectId: projectId ?? null,
        region: region ?? null,
        monthlyCost: monthlyCost ?? null,
        status: "ACTIVE",
      },
    }),
    db.product.update({
      where: { id: productId },
      data: { deployCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ orderId: order.id });
}
