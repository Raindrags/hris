import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL;

  // 1. Cek konfigurasi environment
  if (!backendUrl) {
    console.error("BACKEND_API_URL belum diatur di environment");
    return NextResponse.json(
      { success: false, error: "Konfigurasi server backend tidak ditemukan" },
      { status: 500 },
    );
  }

  try {
    // 2. Ambil parameter dari request frontend
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const divisiId = searchParams.get("divisiId");

    // Validasi basic di sisi Next.js
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Parameter startDate dan endDate wajib diisi!",
        },
        { status: 400 },
      );
    }

    // 3. Susun parameter untuk dikirim ke backend
    const backendQueryParams = new URLSearchParams({
      startDate,
      endDate,
    });
    if (divisiId) {
      backendQueryParams.append("divisiId", divisiId);
    }

    // 4. Ambil token otorisasi dari frontend (jika ada) untuk diteruskan
    const authHeader = req.headers.get("authorization");

    // 5. Lakukan fetch ke backend NestJS
    const targetUrl = `${backendUrl}/reports/rekap-absensi?${backendQueryParams.toString()}`;
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }), // Teruskan token JWT ke NestJS
      },
      // Matikan cache jika laporan ini sering berubah nilainya
      cache: "no-store",
    });

    // 6. Tangani respons dari backend
    const data = await res.json();

    if (!res.ok) {
      console.warn(
        `Backend /reports/rekap-absensi merespons dengan status ${res.status}`,
      );
      return NextResponse.json(data, { status: res.status });
    }

    // Jika berhasil, kembalikan datanya ke frontend
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Gagal mengambil data laporan dari backend:", error);
    return NextResponse.json(
      { success: false, error: "Gagal terhubung ke server backend" },
      { status: 500 },
    );
  }
}
