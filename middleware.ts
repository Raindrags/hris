import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Ensure this matches the secret used in your NestJS JwtModule
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-negara-super-kuat-123",
);

export async function middleware(request: NextRequest) {
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
  ];

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Define Protected Routes
  const isAdminHrisRoute = pathname.startsWith("/admin");
  const isPegawaiRoute = pathname.startsWith("/pegawai");
  const isGaRoute = pathname.startsWith("/ga");
  const isPortalRoute = pathname.startsWith("/portal");

  const isProtected =
    isAdminHrisRoute || isPegawaiRoute || isGaRoute || isPortalRoute;

  // 3. Check Token Existence
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/error?code=401", request.url));
  }

  // 4. Verify JWT and Check Role
  if (isProtected && token) {
    try {
      // Decode the JWT using the edge-compatible 'jose' library
      const { payload } = await jwtVerify(token, SECRET_KEY);

      // Extract the single role string based on your NestJS payload
      const userRole = payload.role as string;

      // Validate HRIS Admin Access
      if (isAdminHrisRoute && userRole !== "ADMIN_HRIS") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Validate GA Admin Access
      if (isGaRoute && userRole !== "ADMIN_GA") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Optional: Validate Pegawai / User Portal Access
      // Uncomment and adjust the roles if standard users need specific roles
      /*
      if ((isPegawaiRoute || isPortalRoute) && userRole !== "USER" && userRole !== "PEGAWAI") {
         return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      */
    } catch (error) {
      // Handle expired or invalid tokens
      return NextResponse.redirect(new URL("/error?code=401", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
