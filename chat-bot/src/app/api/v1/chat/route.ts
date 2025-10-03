import { error, success } from "@/lib/apiResponse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

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
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro" 

    }); 
    const result = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });


    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) { 
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close(); 
      },
    });


      return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
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