import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});



export const loginSchema = z.object({
  email: z.email({message:"Invalid email address"}),
  password: z.string().min(1, "Password is required"),
});
