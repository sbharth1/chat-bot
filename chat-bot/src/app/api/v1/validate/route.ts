import { NextRequest } from "next/server";
import { error, success } from "@/lib/apiResponse";
import { parseAuthCookie, verifyToken } from "@/lib/auth/auth";
import db from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const token = parseAuthCookie(req.headers.get("cookie") || undefined);
    if (!token) return error("Unauthorized", 401, "UNAUTHORIZED");

    const decoded = verifyToken(token) as any;
    const userId = decoded?.userId ?? (decoded?.sub ? Number(decoded.sub) : undefined);
    if (!userId) return error("Invalid token", 401, "INVALID_TOKEN");

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return error("User not found", 404, "USER_NOT_FOUND");

    return success({ user: { id: user.id, email: user.email, fullName: user.fullName } }, 200);
  } catch (e) {
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
} 