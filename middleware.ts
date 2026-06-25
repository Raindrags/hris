import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "rahasia-negara-super-kuat-123",
  );

  const pathname = request.nextUrl.pathname;

  // ========================================================
  // 1. TANGKAP MAGIC LINK DARI WHATSAPP
  // ========================================================
  const urlToken = request.nextUrl.searchParams.get("token");

  // Jika URL memiliki parameter ?token=... (Artinya user datang dari WA)
  if (urlToken) {
    try {
      // Verifikasi keaslian token dari URL
      await jwtVerify(urlToken, SECRET_KEY);

      // Bersihkan URL dari parameter ?token=... agar terlihat rapi di browser
      const cleanUrl = new URL(pathname, request.url);
      request.nextUrl.searchParams.forEach((value, key) => {
        if (key !== "token") cleanUrl.searchParams.set(key, value);
      });

      const response = NextResponse.redirect(cleanUrl);

      // SIMPAN TOKEN KE COOKIE BROWSER USER (Ini kunci utamanya)
      response.cookies.set("access_token", urlToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // Sesi berlaku 1 hari
      });

      return response;
    } catch (error: any) {
      console.log("❌ MAGIC LINK INVALID/EXPIRED:", error.message);
      // Lempar ke halaman login yang sudah Anda buat dengan pesan error dinamis
      return NextResponse.redirect(
        new URL("/login?error=Token_tidak_valid_atau_kadaluarsa", request.url),
      );
    }
  }

  // ========================================================
  // 2. CEK COOKIE UNTUK REQUEST BIASA (Setelah login dari WA)
  // ========================================================
  const token = request.cookies.get("access_token")?.value;

  // 3. Define Public Paths
  const publicPaths = [
    "/error",
    "/login",
    "/unauthorized",
    "/api",
    "/_next",
    "/favicon.ico",
    "/uploads",
  ];

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 4. Define Protected Routes
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

  // 5. Check Token Existence (Blokir jika tidak ada cookie)
  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", request.url),
    );
  }

  // 6. Verify JWT and Check Role
  if (isProtected && token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userRole = payload.role as string;

      // Validate HRIS Admin Access
      if (isAdminHrisRoute && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if ((isGaRoute || isCarfleetAdminRoute) && userRole !== "ADMIN_GA") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Izinkan PEGAWAI, ADMIN, dan ADMIN_GA masuk ke halaman Carfleet User
      // (Agar Anda tidak kena blokir saat testing menggunakan akun Admin)
      const allowedCarfleetRoles = ["PEGAWAI", "ADMIN", "ADMIN_GA"];
      if (isCarfleetUserRoute && !allowedCarfleetRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error: any) {
      console.log("JWT VERIFY ERROR:", error.message);
      // Lempar ke halaman login jika token expire di tengah pemakaian
      return NextResponse.redirect(
        new URL(`/login?error=session_expired`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
