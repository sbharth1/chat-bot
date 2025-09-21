import { NextRequest } from "next/server";
import { error, success } from "@/lib/apiResponse";
import db from "@/lib/db/db";
import { chats } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const rows = await db.query.chats.findMany({ 
      where: and(eq(chats.userId, user.id), isNull(chats.deletedAt)) 
    });
    return success({ chats: rows }, 200);
  } catch (e) {
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const body = await req.json();
    const title = (body?.title ?? "New Chat").toString();

    const inserted = await db.insert(chats).values({ userId: user.id, title }).returning();
    return success({ chat: inserted[0] }, 201);
  } catch (e) {
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
} 