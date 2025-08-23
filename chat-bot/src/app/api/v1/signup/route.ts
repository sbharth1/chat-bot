import { NextRequest } from "next/server";
import { success, error } from "@/lib/apiResponse";
import db from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { signupSchema } from "@/lib/validators/validate";

export async function POST(req: NextRequest){
  try {
    const body = await req.json(); 

    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return error(validation.error.issues[0]?.message || "Invalid input", 400);
    }
    const { fullName, email, password } = validation.data;

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      return error("Email already in use", 409);
    }
 
    const hashedPassword = await bcrypt.hash(password, 12);
    const inserted = await db
      .insert(users)
      .values({ fullName, email, password: hashedPassword })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      });

    return success(
      { message: "Successfully signed up", user: inserted[0] },
      201
    );
  } catch (err) {
    console.error(err);
    return error("Internal Server Error", 500);
  }
}
