import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nestResponse = await fetch(
      `${process.env.BACKEND_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.identifier, // Memetakan "identifier" dari frontend ke "email" di backend
          password: body.password,
        }),
      },
    );

    const data = await nestResponse.json();

    if (!nestResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Login gagal" },
        { status: nestResponse.status },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    // Set Token
    response.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    // Set Role (PENTING: Gunakan data.user.role dari backend)
    response.cookies.set("role", data.user.role || "USER", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // (Opsional) Simpan user_data untuk dipanggil di UI History form jika perlu
    response.cookies.set("user_data", JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
