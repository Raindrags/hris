"use server";

import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:3434";

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}
function getUserIdFromToken(token: string) {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedJson = Buffer.from(payloadBase64, "base64").toString();
    const payload = JSON.parse(decodedJson);

    // Sesuai auth.controller.ts, ID mungkin disimpan di 'sub' atau 'id'
    return payload.id || payload.sub || null;
  } catch (error) {
    return null;
  }
}

export async function getFilteredTeamReportData(
  startDate: string,
  endDate: string,
  subordinateId: string,
) {
  try {
    const token = await getToken();
    if (!token) return { success: false, error: "Unauthorized" };

    const params = new URLSearchParams({ startDate, endDate });
    if (subordinateId && subordinateId !== "ALL") {
      params.append("subordinateId", subordinateId);
    }

    const res = await fetch(
      `${API_URL}/reports/rekap-absensi-tim?${params.toString()}`,
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
  } catch (error: unknown) {
    return { success: false, error: "Terjadi kesalahan koneksi ke server" };
  }
}

export async function getInitialTeamData() {
  try {
    const token = await getToken();
    if (!token) return { success: false, redirect: true };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 1. Ekstrak ID dari token
    const userId = getUserIdFromToken(token);
    let userName = "";

    // 2. Siapkan array fetch untuk dijalankan paralel
    const fetchPromises = [
      fetch(`${API_URL}/attendance-periods`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/users/subordinates`, { headers, cache: "no-store" }),
    ];

    // 3. Jika ID berhasil didapat, tambahkan request fetch profil (mengarah ke GET /users/:id)
    if (userId) {
      fetchPromises.push(
        fetch(`${API_URL}/users/${userId}`, { headers, cache: "no-store" }),
      );
    }

    const responses = await Promise.all(fetchPromises);
    const periodsRes = responses[0];
    const subordinatesRes = responses[1];
    const userProfileRes = responses[2]; // Bisa undefined jika userId tidak ada

    if (!periodsRes.ok || !subordinatesRes.ok) {
      return {
        success: false,
        error: "Gagal mengambil data dari server backend",
      };
    }

    const periodsData = await periodsRes.json();
    const subordinatesData = await subordinatesRes.json();

    // 4. Ekstrak nama pengguna jika request profil sukses
    if (userProfileRes && userProfileRes.ok) {
      const userData = await userProfileRes.json();
      // Mengacu pada users.controller.ts, response-nya dibungkus dengan { success: true, data: ... }
      userName = userData?.data?.name || "";
    }

    return {
      success: true,
      periods: periodsData.data || periodsData,
      subordinates: subordinatesData.data || subordinatesData,
      userName: userName, // Kirim ke page
    };
  } catch (error: unknown) {
    return { success: false, error: "Terjadi kesalahan koneksi ke backend" };
  }
}
