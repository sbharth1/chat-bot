import jwt, { type JwtPayload } from "jsonwebtoken";
import Cookie from "cookie";

interface MyTokenPayload extends JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}


const secretKey = process.env.NEXTAUTH_SECRET!;

export const generateToken = (payload: MyTokenPayload) => {
  if (!secretKey) {
    throw new Error("NEXTAUTH_SECRET is not defined. Set it in your environment to issue tokens.");
  }
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
    if (!secretKey) return null;
    const decoded = jwt.verify(token, secretKey) as MyTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
