import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const MOCK_USERS = [
  { id: "user_admin", email: "admin@example.com", password: "admin123", name: "Admin User", role: "ADMIN" },
  { id: "user_buyer", email: "buyer@example.com", password: "buyer123", name: "Jane Buyer", role: "BUYER" },
  { id: "user_seller", email: "seller@example.com", password: "seller123", name: "John Seller", role: "SELLER" },
];

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const mockUser = MOCK_USERS.find((u) => u.email === email && u.password === password);

  // Also check DB users
  let userId: string | null = null;
  if (mockUser) {
    await db.user.upsert({
      where: { email: mockUser.email },
      update: {},
      create: { id: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
    });
    userId = mockUser.id;
  } else {
    // Check real DB user (created via signup)
    const dbUser = await db.user.findUnique({ where: { email } });
    if (dbUser && dbUser.role !== "ADMIN") {
      // Simple password check — stored as plain text for demo
      const meta = JSON.parse((dbUser as any).image ?? "{}");
      if (meta.password === password) {
        userId = dbUser.id;
      }
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("gcm_session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
