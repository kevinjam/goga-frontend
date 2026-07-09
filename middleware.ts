import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_KEYS } from "@/lib/auth-storage";

const protectedRoutes = [
  "/dashboard",
  "/receipts",
  "/settings",
  "/dashboard/payments",
  "/dashboard/receipts",
  "/dashboard/reports",
  "/dashboard/members"
];
const authRoutes = ["/login", "/reset-password"];
const loginChallengeRoutes = ["/login/verify"];
const passwordChangeRoute = "/change-password";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(AUTH_COOKIE_KEYS.access)?.value;
  const mustChangePassword =
    request.cookies.get(AUTH_COOKIE_KEYS.mustChangePassword)?.value === "true";
  const isAuthenticated = Boolean(accessToken);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isLoginChallengeRoute = loginChallengeRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPasswordChangeRoute = pathname === passwordChangeRoute;

  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isAuthenticated && isPasswordChangeRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && mustChangePassword && isProtected) {
    return NextResponse.redirect(new URL(passwordChangeRoute, request.url));
  }

  if (isAuthenticated && mustChangePassword && isAuthRoute) {
    return NextResponse.redirect(new URL(passwordChangeRoute, request.url));
  }

  if (isAuthenticated && mustChangePassword && isLoginChallengeRoute) {
    return NextResponse.redirect(new URL(passwordChangeRoute, request.url));
  }

  if (isAuthenticated && !mustChangePassword && isPasswordChangeRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthenticated && !mustChangePassword && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthenticated && !mustChangePassword && isLoginChallengeRoute) {
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
    "/reset-password",
    "/change-password"
  ]
};
