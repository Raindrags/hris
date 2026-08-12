"use server";

import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:3434";

// Fungsi Bantuan untuk mendapatkan token
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

// 1. Mengambil Master Divisi
export async function getDivisions() {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/divisions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [] };
    const json = await res.json();
    return { success: true, data: json.data || [] };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// 2. Mengambil Master Periode
export async function getPeriods() {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/attendance-periods`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [] };
    const json = await res.json();
    // json biasanya langsung array, atau di dalam json.data
    const data = Array.isArray(json) ? json : json.data || [];
    return { success: true, data: data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// 3. Mengambil Data Laporan (Berdasarkan Filter)
export async function getFilteredReportData(
  startDate: string,
  endDate: string,
  divisiId: string,
) {
  try {
    const token = await getToken();
    if (!token) return { success: false, error: "Unauthorized" };

    // Bangun URL dengan parameter query
    const params = new URLSearchParams({ startDate, endDate });
    if (divisiId && divisiId !== "ALL") {
      params.append("divisiId", divisiId);
    }

    // Arahkan ke endpoint laporan backend Bos
    const res = await fetch(
      `${API_URL}/reports/rekap-absensi?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) return { success: false, error: `Error: ${res.status}` };
    const responseData = await res.json();

    return responseData.success !== undefined
      ? responseData
      : { success: true, data: responseData };
  } catch (error: any) {
    return { success: false, error: "Terjadi kesalahan koneksi ke server" };
  }
}
