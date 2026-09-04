import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Parsing body payload dari frontend
    const body = await req.json();

    // 2. Coba ambil token dari Header Authorization (dari frontend)
    const authHeader = req.headers.get("authorization");
    let token = authHeader ? authHeader.split(" ")[1] : undefined;

    if (!token) {
      token = req.cookies.get("access_token")?.value;

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

    const res = await fetch(`${backendUrl}/warnings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok || data.success) {
      return NextResponse.json({ success: true, data }, { status: res.status });
    }

    // Kembalikan error yang dilempar oleh NestJS jika gagal
    return NextResponse.json(
      {
        success: false,
        error: data.message || "Gagal menyimpan surat peringatan",
      },
      { status: res.status },
    );
  } catch (error) {
    console.error("Proxy post-warnings error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}
