import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3434';
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_super_kuat';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token tidak ditemukan' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Token tidak valid' }, { status: 401 });
    }

    const body = await request.json();

    // Forward ke NestJS: /bookings/titip
    const res = await fetch(`${BACKEND_URL}/bookings/titip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'BFF Error' }, { status: 500 });
  }
}