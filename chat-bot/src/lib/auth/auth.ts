import jwt, { type JwtPayload } from "jsonwebtoken";
import "dotenv/config";

interface MyTokenPayload extends JwtPayload {
  userId: number;
  email: string;
}

const secretKey = process.env.NEXTAUTH_SECRET!;

if (!secretKey) {
  throw new Error("FATAL ERROR: NEXTAUTH_SECRET is not defined.");
}

export const generateToken = (payload: MyTokenPayload) => {
  return jwt.sign(payload, secretKey, { expiresIn: "7h" });
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, secretKey) as MyTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
