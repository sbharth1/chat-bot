import jwt, { type JwtPayload } from "jsonwebtoken";

interface MyTokenPayload extends JwtPayload {
  userId: number;
  email: string;
}

const secretKey = process.env.NEXTAUTH_SECRET!;

if (!secretKey) {
  throw new Error("FATAL ERROR: NEXTAUTH_SECRET is not defined.");
}

export const generateToken = (payload: MyTokenPayload) => {
  try {
    return jwt.sign(payload, secretKey, { expiresIn: "7h" });
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
};

export const verifyToken = (token: string) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const decoded = jwt.verify(token, secretKey) as MyTokenPayload;
    
    if (!decoded || !decoded.userId || !decoded.email) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};
