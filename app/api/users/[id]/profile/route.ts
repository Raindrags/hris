import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 },
      );

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl)
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 },
      );

    const body = await req.json();

    const res = await fetch(`${backendUrl}/users/${id}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // 🔍 Logging untuk debugging
    console.log("Backend /users/profile response status:", res.status);
    console.log("Backend response body:", data);

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy profile error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
