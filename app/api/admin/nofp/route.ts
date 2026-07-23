import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const backendUrl =
      process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    // 2. Ambil data dari client sebagai FormData (bukan JSON)
    const formData = await req.formData();

    // 3. Teruskan FormData ke backend NestJS
    const res = await fetch(`${backendUrl}/requests/admin/no-fp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    // Kembalikan ke client sesuai status dari backend
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Gagal menyimpan ke backend" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Proxy admin no-fp error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
