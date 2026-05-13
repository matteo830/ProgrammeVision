import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const publicPaths = ["/login", "/forgot-password", "/reset-password", "/api/webhook/ghl", "/api/auth"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && pathname === "/login") {
    const role = (req.auth?.user as { role?: string })?.role;
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url));
  }

  if (isLoggedIn && pathname === "/") {
    const role = (req.auth?.user as { role?: string })?.role;
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url));
  }

  // Protéger /admin (sauf /admin/setup)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/setup")) {
    const role = (req.auth?.user as { role?: string })?.role;
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
