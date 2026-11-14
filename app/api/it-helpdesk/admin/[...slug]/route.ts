import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
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

    // Mengambil path dinamis (misal: 'stats', 'complaints', atau 'logs')
    const path = params.slug.join("/");

    // Meneruskan parameter query (misal: ?status=PENDING)
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    const targetUrl = `${backendUrl}/it-helpdesk/admin/${path}${searchParams ? `?${searchParams}` : ""}`;

    // Meneruskan request ke backend NestJS
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy GET Admin IT-Helpdesk error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
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

    // Mengambil path dinamis (misal: 'complaint/123/status')
    const path = params.slug.join("/");
    const targetUrl = `${backendUrl}/it-helpdesk/admin/${path}`;

    // Meneruskan request ke backend NestJS
    const res = await fetch(targetUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy PATCH Admin IT-Helpdesk error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}
