import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");

    const backendRes = await fetch(
      `${process.env.BACKEND_API_URL}/key-retrieval/take`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify(body),
      },
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal terhubung ke server backend" },
      { status: 500 },
    );
  }
}
