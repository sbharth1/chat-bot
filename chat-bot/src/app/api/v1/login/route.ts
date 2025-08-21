import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { error, success } from "@/lib/apiResponse";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

      if (!result.success) {
        const tree = z.treeifyError(result.error);  
        return NextResponse.json({ error: tree }, { status: 400 });
    }

    const { email, password } = result.data;

    console.log(email,'---email',password,'--password')

    return success({ message: "Successfully signed up" }, 201);
  } catch (err) {
    console.error(err);
    return error("Internal Server Error", 500);
  }
}
