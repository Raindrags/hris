// app/api/auth/wa-login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectPath = url.searchParams.get("redirect") || "/pegawai/dashboard";

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", request.url),
    );
  }

  try {
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

    const cookieStore = await cookies();

    cookieStore.set("user_data", JSON.stringify(data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    cookieStore.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    const safeRedirect = redirectPath.startsWith("/")
      ? redirectPath
      : "/pegawai/dashboard";
    return NextResponse.redirect(new URL(safeRedirect, request.url));
  } catch (error) {
    console.error("WA Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url),
    );
  }
}
