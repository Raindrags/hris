import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    console.error("BACKEND_API_URL belum diatur di environment");
    // Fallback aman: kembalikan array kosong
    return NextResponse.json([], { status: 200 });
  }

  try {
    const res = await fetch(`${backendUrl}/calendar/holidays`);
    // Jika backend belum punya endpoint ini, kembalikan array kosong
    if (!res.ok) {
      console.warn(
        `Backend /calendar/holidays mengembalikan status ${res.status}`,
      );
      return NextResponse.json([], { status: 200 });
    }
    const data = await res.json();
    // Pastikan data berupa array string tanggal (YYYY-MM-DD)
    return NextResponse.json(Array.isArray(data) ? data : (data?.data ?? []));
  } catch (error) {
    console.error("Gagal mengambil data libur dari backend:", error);
    return NextResponse.json([], { status: 200 });
  }
}
