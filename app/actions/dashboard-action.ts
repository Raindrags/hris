"use server";

import { cookies } from "next/headers";

export async function getDashboardData() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return { success: false, error: "Backend URL tidak dikonfigurasi" };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch(`${backendUrl}/pegawai/dashboard`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  return res.json();
}
