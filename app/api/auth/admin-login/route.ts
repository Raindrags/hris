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
          email: body.identifier,
          password: body.password,
        }),
      },
    );
    console.log(process.env.BACKEND_API_URL)
   const data = await nestResponse.json();

    if (!nestResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Login gagal" },
        { status: nestResponse.status },
      );
    }

   const response = NextResponse.json({ 
      success: true,
      user: data.user 
    });

    response.cookies.set("access_token", data.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    response.cookies.set("role", "ADMIN", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    // 3. Return response yang sudah berisi instruksi set-cookie
    return response;
  } catch (error) {
   
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
