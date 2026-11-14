import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ==============================================================
  // 1. PROXY API (SOLUSI CORS & 401 UNAUTHORIZED)
  // ==============================================================
  if (pathname.startsWith("/api/proxy")) {
    const targetPath = pathname.replace("/api/proxy", "");

    const targetUrl = new URL(
      `https://hris.maitreyawirads.dpdns.org/api${targetPath}${request.nextUrl.search}`,
    );

    const requestHeaders = new Headers(request.headers);
    const proxyToken = request.cookies.get("access_token")?.value;

    if (proxyToken) {
      requestHeaders.set("Authorization", `Bearer ${proxyToken}`);
    }

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ==============================================================
  // 2. LOGIKA AUTHENTIKASI ASLI ANDA (JWT & RBAC)
  // ==============================================================
  const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "rahasia-negara-super-kuat-123",
  );

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

  // TAMBAHAN: Rute untuk Admin IT
  const isItAdminRoute = pathname.startsWith("/it-complain/admin-complain");

  const isProtected =
    isAdminHrisRoute ||
    isPegawaiRoute ||
    isCarfleetAdminRoute ||
    isCarfleetUserRoute ||
    isItAdminRoute; // Masukkan ke dalam daftar rute yang dilindungi

  // Check Token Existence
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/error?code=401", request.url));
  }

  // Verify JWT and Check Role
  if (isProtected && token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userRole = payload.role as string;

      if (isAdminHrisRoute) {
        const allowedAdminRoles = [
          "ADMIN",
          "ADMIN_PAUD",
          "ADMIN_SD",
          "ADMIN_SMP",
          "ADMIN_SMA",
        ];
        if (!allowedAdminRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }

      if (isCarfleetAdminRoute && userRole !== "ADMIN_GA") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (isCarfleetUserRoute && userRole !== "USER") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // TAMBAHAN: Validasi Role untuk Admin IT
      if (isItAdminRoute) {
        const allowedItRoles = ["ADMIN", "ADMIN_IT"];
        if (!allowedItRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
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
