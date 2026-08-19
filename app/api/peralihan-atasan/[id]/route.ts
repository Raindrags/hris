import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function proxyRequest(request: NextRequest, endpoint: string) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { success: false, error: "BACKEND_API_URL belum disetting" },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const url = new URL(`${backendUrl}/${endpoint}`);

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: BodyInit | null = null;
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.method !== "DELETE"
  ) {
    body = await request.text();
  }

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyRequest(req, `peralihan-atasan/${id}`);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyRequest(req, `peralihan-atasan/${id}`);
}
