import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Ganti js-cookie dengan bawaan Next.js

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nestResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.identifier,
          password: body.password,
        }),
      },
    );

    const data = await nestResponse.json();

    if (!nestResponse.ok) {
      // Jika login NestJS gagal (password salah, dll)
      return NextResponse.json(
        { message: data.message || "Login gagal" },
        { status: nestResponse.status },
      );
    } // Jika sukses, atur cookie di sisi server!

    const cookieStore = await cookies(); // Pastikan namanya "access_token" agar sesuai dengan dashboard page kita

    cookieStore.set("access_token", data.access_token, {
      httpOnly: true, // Lebih aman, tidak bisa diakses via JavaScript browser
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    }); // Kirim konfirmasi ke Frontend (Form React) bahwa login berhasil

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
