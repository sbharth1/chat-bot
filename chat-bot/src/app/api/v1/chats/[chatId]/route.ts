import { NextRequest } from "next/server";
import { error, success } from "@/lib/apiResponse";
import db from "@/lib/db/db";
import { chats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const params = await context.params;
  try {
    const user = await getUserFromRequest(req);
    if (!user) return error("Unauthorized", 401, "UNAUTHORIZED");

    const chatId = Number(params.chatId);
    if (isNaN(chatId)) return error("Invalid Chat ID", 400, "INVALID_ID");

    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, user.id)),
    });

    if (!chat) {
      return error("Chat not found or not authorized", 404, "NOT_FOUND");
    }

    const result = await db
      .update(chats)
      .set({ deletedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
      .returning();

    return success(
      { message: "Chat soft deleted", chatId },
      200
    );
  } catch (e) {
    console.error("Soft delete chat error:", e);
    return error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}
