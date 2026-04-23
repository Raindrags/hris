"use server";

import { cookies } from "next/headers";

export async function getDashboardData() {
  const backendUrl = process.env.BACKEND_API_URL;
  console.log("[DEBUG] BACKEND_API_URL:", backendUrl);

  if (!backendUrl) {
    console.error("[DEBUG] BACKEND_API_URL tidak dikonfigurasi");
    return {
      success: false,
      error: "BACKEND_API_URL tidak dikonfigurasi",
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const userDataCookie = cookieStore.get("user_data")?.value;

  console.log("[DEBUG] access_token exists:", !!token);
  console.log("[DEBUG] user_data exists:", !!userDataCookie);

  if (userDataCookie) {
    try {
      const user = JSON.parse(userDataCookie);
      console.log("[DEBUG] User ID from cookie:", user.id);
      console.log("[DEBUG] User name from cookie:", user.name);
    } catch (e) {
      console.error("[DEBUG] Failed to parse user_data cookie");
    }
  }

  const url = `${backendUrl}/pegawai/dashboard`;
  console.log("[DEBUG] Fetching:", url);

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    console.log("[DEBUG] Backend response status:", res.status);

    const data = await res.json();
    console.log(
      "[DEBUG] Backend response data:",
      JSON.stringify(data, null, 2).substring(0, 500),
    );

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
    };
  } catch (error: any) {
    console.error("[DEBUG] Fetch error:", error.message);
    return {
      success: false,
      error: error.message || "Gagal terhubung ke backend",
    };
  }
}
