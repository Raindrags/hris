"use server";

import { cookies } from "next/headers";

export async function getDashboardData() {
  const backendUrl =
    process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

  if (!backendUrl) {
    return {
      success: false,
      error: "BACKEND_API_URL tidak dikonfigurasi",
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const userDataCookie = cookieStore.get("user_data")?.value;

  if (userDataCookie) {
    try {
      const user = JSON.parse(userDataCookie);
    } catch (e) {
      console.error("[DEBUG] Failed to parse user_data cookie");
    }
  }

  const url = `${backendUrl}/pegawai/dashboard`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const data = await res.json();
    console.log("===== CEK DATA DARI NESTJS =====", data.user);
    if (!res.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${res.status}`,
        details: data,
      };
    }

    return {
      success: true,
      user: data.user,
      recentRequests: data.recentRequests || [],
      incomingRequests: data.incomingRequests || [],
      potentialSubstitutes: data.potentialSubstitutes || [],
      attendanceSummary: data.attendanceSummary || null, // ← tambahkan ini
    };
  } catch (error: any) {
    console.error("[DEBUG] Fetch error:", error.message);
    return {
      success: false,
      error: error.message || "Gagal terhubung ke backend",
    };
  }
}
