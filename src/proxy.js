import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isProtectedRoute, isPublicRoute, isAdminRoute, AUTH_ROUTES } from "./lib/constants/routes.constants";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token",
  });

  if (AUTH_ROUTES.includes(pathname) && token) {
    const from = request.nextUrl.searchParams.get("from");
    return NextResponse.redirect(new URL(from || "/", request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname) && token.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|verify-email).*)"],
};
