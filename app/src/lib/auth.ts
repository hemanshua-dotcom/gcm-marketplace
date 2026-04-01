"use server";

import { cookies } from "next/headers";
import { db } from "./db";

const SESSION_COOKIE = "gcm_session";
const MOCK_USERS = [
  { id: "user_admin", email: "admin@example.com", password: "admin123", name: "Admin User", role: "ADMIN" },
  { id: "user_buyer", email: "buyer@example.com", password: "buyer123", name: "Jane Buyer", role: "BUYER" },
  { id: "user_seller", email: "seller@example.com", password: "seller123", name: "John Seller", role: "SELLER" },
];

export async function signIn(email: string, password: string) {
  const mockUser = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!mockUser) return { error: "Invalid credentials" };

  // Upsert user in DB
  await db.user.upsert({
    where: { email: mockUser.email },
    update: {},
    create: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, mockUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return { success: true, user: mockUser };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const user = await db.user.findUnique({ where: { id: userId } });
  return user;
}
