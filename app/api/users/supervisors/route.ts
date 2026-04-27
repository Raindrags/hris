import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    const res = await fetch(`${backendUrl}/users/supervisors`, {
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
