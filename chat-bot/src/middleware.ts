import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/auth";

const protectedRoutes = ["/dashboard", "/chat"];
const publicRoutes = ["/login", "/signup", "/"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  let isAuthenticated = false;
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      isAuthenticated = decoded !== null;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Token validation:', {
          hasToken: !!token,
          isValid: isAuthenticated,
          pathname,
          isProtectedRoute
        });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      isAuthenticated = false;
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (publicRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
