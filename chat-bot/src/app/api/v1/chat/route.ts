import { error, success } from "@/lib/apiResponse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt) {
      return error("Prompt is required", 400, "PROMPT_REQUIRED");
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return error("API key not configured", 500, "API_KEY_MISSING");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return success({ text }, 200);
  } catch (err: any) {
    console.error("Error in chat API:", err);
    
    if (err.message?.includes("API key")) {
      return error("Invalid API key", 401, "INVALID_API_KEY");
    }
    
    if (err.message?.includes("quota")) {
      return error("API quota exceeded", 429, "QUOTA_EXCEEDED");
    }
    
    return error("Failed to generate content", 500, "GENERATION_FAILED");
  }
}
