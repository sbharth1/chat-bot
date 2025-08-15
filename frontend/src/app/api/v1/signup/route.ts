import { NextRequest } from "next/server";
import { success, error } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email, password, confirmPassword, fullName } = await req.json();

    if (!email || !password || !confirmPassword || !fullName) {
      return error("All fields are required", 422);
    }

    if (password !== confirmPassword) {
      return error("Passwords do not match", 422);
    }

    console.log(email, fullName);

    return success({ message: "Successfully signed up" }, 201);
  } catch (err) {
    console.error(err);
    return error("Internal Server Error", 500);
  }
}
