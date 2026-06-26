import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ==============================================================
  // 🚀 1. PROXY API (SOLUSI CORS & 401 DARI TUNNEL)
  // ==============================================================
  if (pathname.startsWith("/api/proxy")) {
    // Membuang prefix '/api/proxy' lalu menyambungnya ke Backend NestJS Anda
    const targetPath = pathname.replace("/api/proxy", "");

    // Pastikan query parameter (seperti ?id=1) ikut terbawa
    const targetUrl = new URL(
      `https://hris.maitreyawirads.dpdns.org/api${targetPath}${request.nextUrl.search}`,
    );

    // NextResponse.rewrite ke URL eksternal akan bertindak sebagai PROXY
    // Next.js otomatis meneruskan cookie/header dari frontend ke backend
    return NextResponse.rewrite(targetUrl);
  }

  // ==============================================================
  // 🔒 2. LOGIKA AUTHENTIKASI ASLI ANDA (TIDAK DIUBAH)
  // ==============================================================
  const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "rahasia-negara-super-kuat-123",
  );

  console.log("Panjang Secret:", process.env.JWT_SECRET?.length || 0);
  console.log("================================");

  const token = request.cookies.get("access_token")?.value;

  // Define Public Paths
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

  // Define Protected Routes
  const isAdminHrisRoute = pathname.startsWith("/admin");
  const isPegawaiRoute = pathname.startsWith("/pegawai");
  const isCarfleetAdminRoute = pathname.startsWith("/carfleet/admin");
  const isCarfleetUserRoute = pathname.startsWith("/carfleet/user");

  const isProtected =
    isAdminHrisRoute ||
    isPegawaiRoute ||
    isCarfleetAdminRoute ||
    isCarfleetUserRoute;

  // Check Token Existence
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/error?code=401", request.url));
  }

  // Verify JWT and Check Role
  if (isProtected && token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userRole = payload.role as string;
      console.log("=== CEK ROLE DARI JWT ===");
      console.log("Tujuan Route:", pathname);
      console.log("Role User:", userRole);
      console.log("=========================");

      if (isAdminHrisRoute && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (isCarfleetAdminRoute && userRole !== "ADMIN_GA") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (isCarfleetUserRoute && userRole !== "USER") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (isPegawaiRoute && userRole !== "USER") {
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
