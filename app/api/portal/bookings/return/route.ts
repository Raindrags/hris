import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3434';
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_super_kuat';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json(); // Berisi { bookingId: "..." }

    // Tembak ke endpoint pengembalian di NestJS
    const res = await fetch(`${BACKEND_URL}/bookings/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': decoded.userId,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Token Invalid / Error' }, { status: 500 });
  }
}