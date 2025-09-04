import { NextResponse } from "next/server";
import { success, error } from "@/lib/apiResponse";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Successfully logged out" },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error(err);
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}
