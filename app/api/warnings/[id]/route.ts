import { NextRequest, NextResponse } from "next/server";

const getAuthToken = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader) return authHeader.split(" ")[1];
  return req.cookies.get("access_token")?.value;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params di sini (Wajib untuk Next.js 15+)
    const resolvedParams = await params;

    const token = getAuthToken(req);
    const body = await req.json();
    const backendUrl = process.env.BACKEND_API_URL;

    const res = await fetch(`${backendUrl}/warnings/${resolvedParams.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error proxy PATCH" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params di sini (Wajib untuk Next.js 15+)
    const resolvedParams = await params;

    const token = getAuthToken(req);
    const backendUrl = process.env.BACKEND_API_URL;

    const res = await fetch(`${backendUrl}/warnings/${resolvedParams.id}`, {
      method: "DELETE",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error proxy DELETE" },
      { status: 500 },
    );
  }
}
