import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET_KEY!;

if(!secretKey){
    throw new Error("FATAL ERROR: JWT_SECRET_KEY is not defined.")
}