import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import "dotenv/config";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email!),
          });

          if (!existingUser) {
            await db.insert(users).values({
              email: user.email!,
              fullName: user.name || user.email!.split("@")[0],
              password: "google_auth", 
              profileImage: user.image || null,
            });
          } else if (user.image && !existingUser.profileImage) {
            await db
              .update(users)
              .set({ profileImage: user.image })
              .where(eq(users.id, existingUser.id));
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
