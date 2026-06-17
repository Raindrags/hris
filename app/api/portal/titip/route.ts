import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

function getUserIdFromCookie() {
  const token = cookies().get("access_token")?.value;
  if (!token) return null;
  try { return decodeJwt(token).sub || decodeJwt(token).userId || null; } 
  catch { return null; }
}

export async function POST(request: Request) {
  const userId = getUserIdFromCookie();
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/bookings/titip`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId as string },
      body: JSON.stringify({
        bookingId: body.tripId, 
        description: body.itemDesc,
        receiver: body.receiver
      }),
    });
    
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: "BFF Error" }, { status: 500 });
  }
}