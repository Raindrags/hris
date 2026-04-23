import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ambil token dan data user dari cookies
  const token = request.cookies.get("access_token")?.value;
  const userDataCookie = request.cookies.get("user_data")?.value;

  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isPegawaiPath = request.nextUrl.pathname.startsWith("/pegawai");

  // Jika mengakses halaman admin
  if (isAdminPath) {
    // Jika tidak ada token, redirect ke login
    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=session_expired", request.url),
      );
    }

    // Periksa role dari cookie user_data
    if (userDataCookie) {
      try {
        const user = JSON.parse(userDataCookie);
        if (user.role !== "ADMIN") {
          // Bukan admin, redirect ke unauthorized
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
        
console.log('[Middleware] Path:', request.nextUrl.pathname);
console.log('[Middleware] Token:', token ? 'exists' : 'missing');
console.log('[Middleware] User data cookie:', userDataCookie ? 'exists' : 'missing');
if (userDataCookie) {
  try {
    const user = JSON.parse(userDataCookie);
    console.log('[Middleware] User role:', user.role);
  } catch { ... }
}
      } catch {
        // Jika cookie rusak, redirect ke login
        return NextResponse.redirect(
          new URL("/login?error=session_expired", request.url),
        );
      }
    } else {
      // Tidak ada user_data, redirect ke login
      return NextResponse.redirect(
        new URL("/login?error=session_expired", request.url),
      );
    }
  }

  // Jika mengakses halaman pegawai (tetap butuh login)
  if (isPegawaiPath && !token) {
    return NextResponse.redirect(
      new URL("/login?error=session_expired", request.url),
    );
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - halaman login
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
