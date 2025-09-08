import jwt, { type JwtPayload } from "jsonwebtoken";
import Cookie from "cookie";

interface MyTokenPayload extends JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

const secretKey = process.env.NEXTAUTH_SECRET!;

if (!secretKey) {
  throw new Error("FATAL ERROR: NEXTAUTH_SECRET is not defined.");
}

export const generateToken = (payload: MyTokenPayload) => {
  return jwt.sign(payload, secretKey, { expiresIn: "7h" });
};

export function parseAuthCookie(
  cookieHeader: string | undefined
): string | null {
  if (!cookieHeader) return null;
  const cookies = Cookie.parse(cookieHeader);
  return cookies.token || null; 

}

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, secretKey) as MyTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
