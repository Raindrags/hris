import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    // Meneruskan request ke backend NestJS (@Controller('it-helpdesk') & @Get('history'))
    const res = await fetch(`${backendUrl}/it-helpdesk/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy GET History error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}
