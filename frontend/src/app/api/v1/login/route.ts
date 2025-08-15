import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = await req.json();

    if (!email || !password) {
      error("all feilds are required", 422);
    }

    return success({ message: "Successfully signed up" }, 201);
  } catch (err) {
    console.error(err);
    return error("Internal Server Error", 500);
  }
}
