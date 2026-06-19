import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // pastikan sudah install npm i jsonwebtoken @types/jsonwebtoken

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3434';
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_super_kuat';

export async function POST(request: Request) {
  try {
    // 1. Ambil token dari header Authorization yang dikirim oleh Frontend
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token tidak ditemukan' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 2. Decode token JWT untuk mendapatkan userId
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Token kedaluwarsa atau tidak valid' }, { status: 401 });
    }

    // 3. Ambil body data dari frontend (bookingId, dropOff, seats)
    const body = await request.json();

    // 4. Forward (teruskan) ke NestJS dengan header x-user-id dan URL yang sesuai
    const res = await fetch(`${BACKEND_URL}/bookings/nebeng`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId, // <--- DIKIRIM KE NESTJS
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'BFF Error: ' + error.message },
      { status: 500 }
    );
  }
}