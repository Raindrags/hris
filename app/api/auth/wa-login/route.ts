import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectPath = url.searchParams.get("redirect") || "/dashboard";

  // 1. Token tidak ada sama sekali
  if (!token) {
    return NextResponse.redirect(new URL("/error?code=401", request.url));
  }

  try {
    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_API_URL tidak dikonfigurasi");
    }

    const verifyRes = await fetch(`${backendUrl}/auth/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await verifyRes.json();

    if (!verifyRes.ok || !data.success) {
      // Token tidak valid atau expired → langsung redirect ke halaman error
      return NextResponse.redirect(new URL("/error?code=expired", request.url));
    }

    // Sukses: set cookie dan redirect ke halaman tujuan
    const response = NextResponse.redirect(
      new URL(
        redirectPath.startsWith("/") ? redirectPath : "/dashboard",
        request.url,
      ),
    );

    response.cookies.set("user_data", JSON.stringify(data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    if (data.accessToken) {
      response.cookies.set("access_token", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error("WA Login error:", error);
    // Kesalahan jaringan atau server
    return NextResponse.redirect(new URL("/error?code=500", request.url));
  }
}
