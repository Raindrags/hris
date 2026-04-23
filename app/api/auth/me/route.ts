import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data")?.value;

  console.log(
    "[DEBUG /api/auth/me] user_data cookie:",
    userData ? "exists" : "missing",
  );

  if (!userData) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = JSON.parse(userData);
    console.log("[DEBUG /api/auth/me] User parsed:", user.id, user.name);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[DEBUG /api/auth/me] Parse error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
