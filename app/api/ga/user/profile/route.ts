import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3434';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenQuery = searchParams.get('token');
    
    // Atau ambil dari header Authorization jika frontend mengirimnya lewat header
    const authHeader = request.headers.get('Authorization');
    
    // Tentukan token mana yang dipakai
    const token = authHeader || (tokenQuery ? `Bearer ${tokenQuery}` : '');

    // 2. Teruskan request ke Backend Utama beserta Token Magic Link-nya
    const res = await fetch(`${BACKEND_URL}/user/profile`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token 
      },
      cache: 'no-store',
    });
    
    const data = await res.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}