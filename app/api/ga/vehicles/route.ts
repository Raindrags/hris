
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3434';

export async function GET() {
  try {
    // Meneruskan request GET ke NestJS
    const res = await fetch(`${BACKEND_URL}/vehicles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Agar data selalu up-to-date
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || 'Gagal mengambil data' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("BFF Error (GET Vehicles):", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error (BFF)' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Meneruskan payload POST ke NestJS
    const res = await fetch(`${BACKEND_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || 'Gagal menambah data' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("BFF Error (POST Vehicles):", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error (BFF)' }, { status: 500 });
  }
}