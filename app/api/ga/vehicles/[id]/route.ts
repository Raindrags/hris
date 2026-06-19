import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3434';
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_super_kuat';

// Helper function untuk verifikasi token
function verifyToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // 1. Verifikasi (Opsional jika GET vehicle boleh public, tapi lebih aman dicek)
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ambil query parameter (misal: ?status=Tersedia)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Susun URL ke NestJS
    const targetUrl = status 
      ? `${BACKEND_URL}/vehicles?status=${status}` 
      : `${BACKEND_URL}/vehicles`;

    // 3. Teruskan ke NestJS
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': decoded.userId,
      },
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'BFF Error: ' + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': decoded.userId,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'BFF Error: ' + error.message }, { status: 500 });
  }
}