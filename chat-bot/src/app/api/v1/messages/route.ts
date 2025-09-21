import { NextRequest } from "next/server";
import { error, success } from "@/lib/apiResponse";
import db from "@/lib/db/db";
import { chats, messages } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const url = new URL(req.url);
    const chatId = Number(url.searchParams.get("chatId"));

    if (!chatId) return error("chatId is required", 400, "VALIDATION_ERROR");

    const chat = await db.query.chats.findFirst({ 
      where: and(
        eq(chats.id, chatId), 
        eq(chats.userId, user.id),
        isNull(chats.deletedAt)
      ) 
    });
    if (!chat) return error("Chat not found", 404, "CHAT_NOT_FOUND");

    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)]
    });

    return success({ messages: chatMessages }, 200);
  } catch (e) {
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const body = await req.json();
    const chatId = Number(body?.chatId);
    const content = (body?.content ?? "").toString();
    const role = (body?.role ?? "user").toString();

    if (!chatId || !content) return error("chatId and content are required", 400, "VALIDATION_ERROR");

    const chat = await db.query.chats.findFirst({ 
      where: and(
        eq(chats.id, chatId), 
        eq(chats.userId, user.id),
        isNull(chats.deletedAt) 
      ) 
    });
    if (!chat) return error("Chat not found", 404, "CHAT_NOT_FOUND");

    const inserted = await db.insert(messages).values({ chatId, content, role }).returning();
    return success({ message: inserted[0] }, 201);
  } catch (e) {
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}
