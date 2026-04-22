// app/api/auth/verify-token/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  try {
    // Panggil endpoint backend yang akan dibuat
    const backendRes = await fetch(
      `${process.env.BACKEND_API_URL}/auth/verify-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      },
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal terhubung ke server" },
      { status: 500 },
    );
  }
}
