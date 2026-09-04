import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Ambil JWT dari header request yang masuk (dari client)
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");

    const backendRes = await fetch(
      `${process.env.BACKEND_API_URL}/key-retrieval/schedules`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        cache: "no-store", // Jangan di-cache agar data selalu up-to-date
      },
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal terhubung ke server backend" },
      { status: 500 },
    );
  }
}
