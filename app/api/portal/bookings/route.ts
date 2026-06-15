import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Nanti payload 'body' ini akan dikirim ke NestJS
    // await fetch('http://localhost:3000/bookings', { method: 'POST', body: JSON.stringify(body) });

    console.log("Data Booking Diterima dari Frontend:", body);

    // Simulasi respons sukses dari backend
    return NextResponse.json({
      success: true,
      message: "Booking berhasil diajukan ke GA",
      data: { ...body, id: "booking-" + Date.now(), status: "PENDING" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memproses data" },
      { status: 500 },
    );
  }
}
