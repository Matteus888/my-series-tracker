import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/profile", "/watchlist", "/dashboard", "/favorites", "/settings"];
const publicRoutes = ["/login", "/signup", "/verify-email", "/series"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = await getToken({ req: request });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup|verify-email).*)"],
};
