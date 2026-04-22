import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectPath = url.searchParams.get("redirect") || "/dashboard";

  // 1. Validasi token ada
  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", request.url),
    );
  }

  try {
    // 2. Panggil backend untuk verifikasi token
    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_API_URL tidak dikonfigurasi.");
    }

    const verifyRes = await fetch(`${backendUrl}/auth/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await verifyRes.json();

    if (!verifyRes.ok || !data.success) {
      throw new Error(data.error || "Token tidak valid atau kadaluarsa.");
    }

    // 3. Set cookie httpOnly dengan data user & access token
    const cookieStore = await cookies();

    // Simpan data user (bisa di-parse oleh API Route lain atau Server Component)
    cookieStore.set("user_data", JSON.stringify(data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    // Jika backend memberikan accessToken untuk API calls selanjutnya
    if (data.accessToken) {
      cookieStore.set("access_token", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 hari
      });
    }

    // 4. Redirect ke halaman tujuan
    const safeRedirect = redirectPath.startsWith("/")
      ? redirectPath
      : "/dashboard";
    return NextResponse.redirect(new URL(safeRedirect, request.url));
  } catch (error) {
    console.error("WA Login error:", error);
    // Redirect ke halaman error dengan pesan
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url),
    );
  }
}
