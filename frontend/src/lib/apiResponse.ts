import { NextResponse } from "next/server";

export function success(data: any, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }
  
  export function error(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
  }
  