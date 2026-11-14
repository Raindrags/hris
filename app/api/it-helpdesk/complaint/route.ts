import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Sesi telah habis. Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Konfigurasi Backend URL tidak ditemukan." },
        { status: 500 },
      );
    }

    const body = await req.json();

    // Meneruskan request ke backend NestJS (@Controller('it-helpdesk') & @Post())
    const res = await fetch(`${backendUrl}/it-helpdesk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy POST IT-Helpdesk error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}
