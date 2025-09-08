import { NextRequest, NextResponse } from "next/server";
import { error } from "@/lib/apiResponse";
import db from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth/auth";
import { loginSchema } from "@/lib/validators/validate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.issues[0]?.message || "Invalid input", 400, "VALIDATION_ERROR");
    }

    const { email, password } = parsed.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) {
      return error("Invalid email", 401, "INVALID_EMAIL");
    }

    const passwordMatches = await bcrypt.compare(password, user?.password);

    if (!passwordMatches) {
      return error("Invalid password", 401, "INVALID_PASSWORD");
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      {
        success: true,
        message: "Successfully logged in",
        token
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 7,
    });
    return response;
  } catch (err) {
    console.error(err);
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}
