import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "rahasia-negara-super-kuat-123",
  );

  console.log("Panjang Secret:", process.env.JWT_SECRET?.length || 0);
  console.log("================================");

  const token = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  // 1. Define Public Paths
  const publicPaths = [
    "/error",
    "/login",
    "/unauthorized",
    "/api",
    "/_next",
    "/favicon.ico",
    "/uploads",
    "/carfleet/magic",
  ];

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Define Protected Routes
  const isAdminHrisRoute = pathname.startsWith("/admin");
  const isPegawaiRoute = pathname.startsWith("/pegawai");
  const isGaRoute = pathname.startsWith("/ga");
  const isPortalRoute = pathname.startsWith("/portal");

  const isCarfleetAdminRoute = pathname.startsWith("/carfleet/admin");
  const isCarfleetUserRoute = pathname.startsWith("/carfleet/user");

  const isProtected =
    isAdminHrisRoute ||
    isPegawaiRoute ||
    isGaRoute ||
    isPortalRoute ||
    isCarfleetAdminRoute ||
    isCarfleetUserRoute;

  // 3. Check Token Existence
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/error?code=401", request.url));
  }

  // 4. Verify JWT and Check Role
  if (isProtected && token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userRole = payload.role as string;
      console.log("=== CEK ROLE DARI JWT ===");
      console.log("Tujuan Route:", pathname);
      console.log("Role User:", userRole);
      console.log("=========================");

      // Validate HRIS Admin Access
      if (isAdminHrisRoute && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if ((isGaRoute || isCarfleetAdminRoute) && userRole !== "ADMIN_GA") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Opsional: Jika /carfleet/user hanya boleh untuk pegawai biasa
      if (isCarfleetUserRoute && userRole !== "PEGAWAI") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error: any) {
      console.log("JWT VERIFY ERROR:", error.message);

      return NextResponse.redirect(
        new URL(
          `/error?code=401&err=${encodeURIComponent(error.message)}`,
          request.url,
        ),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
