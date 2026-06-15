import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
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

    // Mengambil riwayat servis dan BBM dari NestJS
    const res = await fetch(`${backendUrl}/ga/maintenance`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ ERROR API GET MAINTENANCE:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
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

    const body = await req.json();

    // Mengirim data servis/BBM baru ke NestJS
    const res = await fetch(`${backendUrl}/ga/maintenance`, {
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
    console.error("❌ ERROR API POST MAINTENANCE:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
