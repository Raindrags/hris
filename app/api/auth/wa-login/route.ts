import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const redirectPath = searchParams.get("redirect") || "/pegawai/dashboard";

  // 1. Jika token tidak ada di URL
  if (!token) {
    return NextResponse.redirect(
      new URL("/error?code=401&err=NoToken", request.url),
    );
  }

  try {
    // 2. Tembak endpoint NestJS Anda
    // Sesuaikan URL ini dengan URL backend NestJS production Anda
    const nestJsApiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://hris.maitreyawirads.dpdns.org";

    // ✨ PERHATIKAN: URL ini sekarang mengarah ke /auth/verify-token sesuai controller Anda
    const verifyResponse = await fetch(`${nestJsApiUrl}/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }), // Mengirim token 5 menit dari WA
    });

    const data = await verifyResponse.json();

    // Jika verifikasi gagal (token expired / salah)
    if (!verifyResponse.ok || !data.success) {
      throw new Error(data.message || "Verifikasi token gagal di backend");
    }

    // 3. Jika sukses, buat respons redirect ke URL tujuan (misal: /carfleet/user)
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    // 4. Tanamkan Token 7 Hari (dari backend) ke Cookie browser
    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Wajib HTTPS di Vercel
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // Berlaku 7 hari
    });

    return response;
  } catch (error: any) {
    console.error("WA Login Error:", error.message);
    return NextResponse.redirect(
      new URL(
        `/error?code=401&err=${encodeURIComponent("Link tidak valid atau sudah kedaluwarsa")}`,
        request.url,
      ),
    );
  }
}
