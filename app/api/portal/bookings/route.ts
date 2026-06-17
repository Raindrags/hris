import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3434";

// Fungsi Helper untuk mengambil User ID dari Token JWT di Cookies
function getUserIdFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    // Decode JWT tanpa perlu verifikasi signature (karena sudah diverifikasi di middleware.ts)
    const payload = decodeJwt(token);
    // Asumsi: ID User disimpan di dalam properti 'sub' atau 'userId' pada payload JWT Anda
    return payload.sub || payload.userId || null;
  } catch (error) {
    console.error("Gagal men-decode token di BFF:", error);
    return null;
  }
}

// =======================================================================
// GET: Mengambil riwayat peminjaman untuk User yang sedang login
// =======================================================================
export async function GET() {
  const userId = getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Sesi telah habis, silakan login kembali." },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/bookings/my-history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId as string, // Oper ID ke NestJS via Header
      },
      cache: "no-store", // Jangan di-cache agar data riwayat selalu aktual
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("BFF Error (GET Bookings):", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server (BFF)." },
      { status: 500 }
    );
  }
}

// =======================================================================
// POST: Mengirim pengajuan peminjaman baru
// =======================================================================
export async function POST(request: Request) {
  const userId = getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Sesi telah habis, silakan login kembali." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // TRANSFROMASI DATA: 
    // Di UI frontend, user hanya memilih angka (misal: 15). 
    // Kita ubah menjadi format ISO string untuk bulan Juni 2026 agar NestJS (Prisma) tidak error.
    // Catatan: Di masa depan jika UI kalendernya dinamis, Anda bisa mengirim full date dari frontend.
    const bookingDate = new Date(2026, 5, parseInt(body.date, 10)); // Bulan ke-5 adalah Juni (indeks dimulai dari 0)

    // Siapkan payload yang bersih untuk NestJS
    const nestPayload = {
      vehicleId: String(body.vehicleId),
      destination: body.destination,
      date: bookingDate.toISOString(),
      timeOut: body.timeOut,
      timeIn: body.timeIn,
      passengers: String(body.passengers),
    };

    const res = await fetch(`${BACKEND_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId as string, // Oper ID ke NestJS via Header
      },
      body: JSON.stringify(nestPayload),
    });

    const data = await res.json();

    // Jika NestJS merespons dengan error (misal 400 Bad Request)
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("BFF Error (POST Booking):", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server (BFF)." },
      { status: 500 }
    );
  }
}