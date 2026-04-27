import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl)
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );

    const res = await fetch(`${backendUrl}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl)
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );

    const body = await req.json();
    const res = await fetch(`${backendUrl}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl)
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );

    const res = await fetch(`${backendUrl}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
