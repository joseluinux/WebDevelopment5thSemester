import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("lumemei_refresh")?.value;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access dashboard → redirect to login
  if (isDashboard && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access auth pages → redirect to dashboard
  if (isAuthPage && refreshToken && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password"],
};
