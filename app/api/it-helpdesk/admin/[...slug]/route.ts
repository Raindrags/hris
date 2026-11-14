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

    // Mengambil path yang dipanggil, misal ['stats'] atau ['complaints']
    const path = params.slug.join("/");

    // Meneruskan query parameters (seperti ?status=PENDING atau ?search=xxx)
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();

    const targetUrl = `${backendUrl}/it-helpdesk/admin/${path}${searchParams ? `?${searchParams}` : ""}`;

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
    console.error("Proxy GET Admin Helpdesk error:", error);
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

    // Mengambil path yang dipanggil, misal ['complaint', '123', 'status']
    const path = params.slug.join("/");
    const targetUrl = `${backendUrl}/it-helpdesk/admin/${path}`;

    const body = await req.json();

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
    console.error("Proxy PATCH Admin Helpdesk error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}
