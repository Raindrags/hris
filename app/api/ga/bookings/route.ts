// File: app/api/ga/bookings/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch ke NestJS (mengambil data booking dengan status PENDING)

  const mockPendingBookings = [
    {
      id: "BKG-001",
      borrower_name: "Budi Santoso, S.Pd.",
      destination: "Dinas Pendidikan Daerah",
      vehicle_name: "Toyota Hiace Commuter",
      date: "Rabu, 15 Juni 2026",
      status: "PENDING",
    },
  ];

  return NextResponse.json({ success: true, data: mockPendingBookings });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, action, note } = body; // action bisa 'APPROVE' atau 'REJECT'

    // TODO: Teruskan ke NestJS untuk update status di Supabase
    console.log(
      `GA Action: ${action} untuk Booking ID: ${bookingId} dengan catatan: ${note}`,
    );

    return NextResponse.json({
      success: true,
      message: `Booking ${bookingId} berhasil di-${action.toLowerCase()}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal update status" },
      { status: 500 },
    );
  }
}
