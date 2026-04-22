"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3434";

export async function getAdminReportData() {
  try {
    const cookieStore = await cookies();

    // Sesuaikan dengan nama cookie di sistem login Anda
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return { success: false, error: "Unauthorized: Token tidak ditemukan" };
    }

    const res = await fetch(`${API_URL}/reports/admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Gagal mengambil data. Status: ${res.status}`,
      };
    }

    const responseData = await res.json();

    if (responseData.success !== undefined) {
      return responseData;
    }
    return { success: true, data: responseData };
  } catch (error: any) {
    console.error("Fetch Error (Admin Report):", error.message);
    return { success: false, error: "Terjadi kesalahan koneksi ke server" };
  }
}
