import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_KEYS } from "@/lib/auth-storage";

const protectedRoutes = ["/dashboard", "/receipts", "/settings"];
const authRoutes = ["/login", "/forgot-password"];
const loginChallengeRoutes = ["/login/verify"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(AUTH_COOKIE_KEYS.access)?.value;
  const isAuthenticated = Boolean(accessToken);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isLoginChallengeRoute = loginChallengeRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthenticated && isLoginChallengeRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/receipts/:path*",
    "/settings/:path*",
    "/login",
    "/login/verify",
    "/forgot-password"
  ]
};
