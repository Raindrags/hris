import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Coba ambil token dari Header Authorization (dari frontend)
    const authHeader = req.headers.get("authorization");
    let token: string | null | undefined = authHeader
      ? authHeader.split(" ")[1]
      : null;

    // 2. Jika tidak ada di Header, coba cari di Cookies
    if (!token) {
      token = req.cookies.get("access_token")?.value ?? null;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Tidak terautentikasi (Token tidak ditemukan)",
        },
        { status: 401 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    // Hit ke endpoint backend NestJS
    const res = await fetch(`${backendUrl}/shifts/employees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success || res.ok) {
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy get-employees-for-assign error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}
