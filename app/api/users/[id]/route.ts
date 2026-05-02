import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();

    // 🔍 Log payload yang dikirim ke backend
    console.log(
      `[API /users/${id}] 📤 Payload dikirim ke backend:`,
      JSON.stringify(body, null, 2),
    );

    const res = await fetch(`${backendUrl}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // 🔍 Log respons dari backend
    if (!res.ok) {
      console.error(
        `[API /users/${id}] ❌ Backend error ${res.status}:`,
        JSON.stringify(data, null, 2),
      );
    } else {
      console.log(
        `[API /users/${id}] ✅ Backend sukses:`,
        JSON.stringify(data, null, 2),
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`[API /users/${id}] 💥 Server error:`, error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
