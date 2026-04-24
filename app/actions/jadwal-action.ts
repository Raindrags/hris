"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_API_URL;

/**
 * Helper untuk mengambil token dengan nama "access_token"
 */
async function getAuthToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get("access_token")?.value;

  if (!token) {
    token = cookieStore.get("token")?.value;
  }

  return token;
}

/**
 * Helper untuk menyusun Headers yang aman
 */
async function getHeaders() {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ PERINGATAN: access_token tidak ditemukan di cookies!");
  }

  return headers;
}

// ============================================================================
// 1. Ambil Semua Template Shift
// ============================================================================
export async function getAllShifts() {
  try {
    const headers = await getHeaders();
    const url = `${API_URL}/shifts`; // SESUAIKAN DENGAN ENDPOINT ASLI ANDA

    console.log("Mencoba fetch ke URL:", url);
    // console.log("Headers:", headers); // Buka komen ini jika ingin memastikan token terkirim

    const res = await fetch(url, {
      cache: "no-store",
      headers,
    });

    console.log("Status Code dari Backend:", res.status);

    // Tangkap jika backend mengembalikan error (misal 401, 404, 500)
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error Response Backend:", errorText);
      return {
        success: false,
        error: `Backend merespons dengan status ${res.status}`,
      };
    }

    const data = await res.json();
    console.log("Format Data dari Backend:", data);

    return data;
  } catch (error: any) {
    console.error("Fetch Gagal (Network error dll):", error.message);
    return {
      success: false,
      error: "Gagal mengambil data jadwal",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 2. Buat Template Shift Baru
// ============================================================================
export async function createShift(payload: any) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/shifts`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) revalidatePath("/pengaturan-jadwal");
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal menyimpan jadwal.",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 3. Update Template Shift
// ============================================================================
export async function updateShift(id: string, payload: any) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/shifts/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) revalidatePath("/pengaturan-jadwal");
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal memperbarui jadwal.",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 4. Hapus Template Shift
// ============================================================================
export async function deleteShift(id: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/shifts/${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();

    if (data.success) revalidatePath("/pengaturan-jadwal");
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal menghapus jadwal.",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 5. Ambil Data Pegawai & Divisi untuk Modal Assign
// ============================================================================
export async function getEmployeesForAssign() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/shifts/employees`, {
      cache: "no-store",
      headers,
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil data pegawai",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 6. Batch Assign Pegawai ke Shift
// ============================================================================
export async function batchAssignShift(userIds: string[], shiftId: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/shifts/assign`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userIds }),
    });
    const data = await res.json();

    if (data.success) revalidatePath("/pengaturan-jadwal");
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal menyimpan penugasan jadwal.",
      errorDetail: error.message,
    };
  }
}
