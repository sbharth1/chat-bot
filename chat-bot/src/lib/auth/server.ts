import { NextRequest } from "next/server";
import db from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseAuthCookie, verifyToken } from "@/lib/auth/auth";

export async function getUserFromRequest(req: NextRequest) {
  const token = parseAuthCookie(req.headers.get("cookie") || undefined);
  if (!token) return null;
  const decoded = verifyToken(token) as any;
  const userId = decoded?.userId ?? (decoded?.sub ? Number(decoded.sub) : undefined);
  if (!userId) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;
  return { id: user.id, email: user.email, fullName: user.fullName };
} 