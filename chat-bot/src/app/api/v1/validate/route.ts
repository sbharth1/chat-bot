import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/apiResponse";
import { parseAuthCookie, verifyToken, generateToken } from "@/lib/auth/auth";
import db from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectTo = searchParams.get("redirect");

    const token = parseAuthCookie(req.headers.get("cookie") || undefined);

    if (token) {
      const decoded = verifyToken(token) as any;
      const userId = decoded?.userId ?? (decoded?.sub ? Number(decoded.sub) : undefined);
      if (!userId) return error("Invalid token", 401, "INVALID_TOKEN");

      const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) return error("User not found", 404, "USER_NOT_FOUND");

      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, req.url));
      }
      return success({ user: { id: user.id, email: user.email, fullName: user.fullName } }, 200);
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) return error("Unauthorized", 401, "UNAUTHORIZED");

    let user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      const fullName = session?.user?.name || email.split("@")[0];
      const randomPassword = randomUUID();
      const hashed = await bcrypt.hash(randomPassword, 10);

      const inserted = await db
        .insert(users)
        .values({ email, fullName, password: hashed })
        .returning();

      user = inserted[0]!;
    }

    const ourToken = generateToken({ userId: user.id, email: user.email });
    const res = redirectTo
      ? NextResponse.redirect(new URL(redirectTo, req.url))
      : NextResponse.json(
          { success: true, user: { id: user.id, email: user.email, fullName: user.fullName } },
          { status: 200 }
        );
    res.cookies.set("token", ourToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 60 * 60,
    });
    return res;
  } catch (e) {
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
} 