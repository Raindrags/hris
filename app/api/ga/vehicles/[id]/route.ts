import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Meneruskan request PATCH (Update) ke NestJS
    const res = await fetch(`${BACKEND_URL}/vehicles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || 'Gagal memperbarui data' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`BFF Error (PATCH Vehicle ${params.id}):`, error);
    return NextResponse.json({ success: false, message: 'Internal Server Error (BFF)' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Meneruskan request DELETE ke NestJS
    const res = await fetch(`${BACKEND_URL}/vehicles/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || 'Gagal menghapus data' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`BFF Error (DELETE Vehicle ${params.id}):`, error);
    return NextResponse.json({ success: false, message: 'Internal Server Error (BFF)' }, { status: 500 });
  }
}