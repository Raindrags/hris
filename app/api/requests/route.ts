import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Ambil token otorisasi dari header atau cookies
    const authHeader = req.headers.get("authorization");
    let token = authHeader ? authHeader.split(" ")[1] : undefined;

    if (!token) {
      token = req.cookies.get("access_token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Tidak terautentikasi (Token tidak ditemukan)",
        },
        { status: 401 },
      );
    }

    // 2. Pastikan URL Backend tersedia
    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    // 3. Tangkap query parameters dari frontend Next.js
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search");
    const divisionId = searchParams.get("divisionId");

    // 4. Susun URL target untuk backend NestJS
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    if (search) queryParams.append("search", search);
    if (divisionId && divisionId !== "ALL")
      queryParams.append("divisionId", divisionId);

    const targetUrl = `${backendUrl}/requests?${queryParams.toString()}`;

    // 5. Teruskan request ke backend NestJS
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    // 6. Kembalikan response dari NestJS ke frontend Next.js
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy GET /api/requests error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server proxy" },
      { status: 500 },
    );
  }
}
