import { NextResponse } from "next/server";

export interface ErrorResponse {
  message: string;
  code?: string;
}

export function success<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }
  
  export function error(message: string, status = 400, code?:string) {
    const errorResponse:ErrorResponse = {message,code};
    return NextResponse.json({ success: false, error: errorResponse }, { status });
  }
  