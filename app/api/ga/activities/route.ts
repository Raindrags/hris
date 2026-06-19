import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3434';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/activities`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await res.json();
    
    // Asumsi backend mengembalikan data list activity
    return NextResponse.json(data.data || []);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}