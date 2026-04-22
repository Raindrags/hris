"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Sesuaikan dengan base URL backend Anda
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Fungsi bantuan ASYNC untuk mengambil token otorisasi dari cookies.
 */
async function getAuthToken() {
  const cookieStore = await cookies();

  // 1. Ambil cookie dengan nama "access_token" (Sesuai dengan file login Anda!)
  let token = cookieStore.get("access_token")?.value;

  // 2. Fallback (cadangan) jika suatu saat Anda menggunakan nama "token"
  if (!token) {
    token = cookieStore.get("token")?.value;
  }

  return token;
}

/**
 * Helper ASYNC untuk menyusun Headers yang aman dari error Symbol Next.js
 */
async function getHeaders() {
  const token = await getAuthToken();

  // Gunakan tipe Record<string, string> yang bersih
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Hanya tambahkan Authorization jika token benar-benar ada dan tidak undefined
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    // Memberikan log di server console untuk memudahkan tracking
    console.warn("⚠️ PERINGATAN: Token otorisasi tidak ditemukan di cookies!");
  }

  return headers;
}

// ============================================================================
// 1. Ambil Daftar Atasan (Supervisors) - Endpoint: /users/supervisors
// ============================================================================
export async function getSupervisors() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users/supervisors`, {
      cache: "no-store",
      headers,
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil data atasan",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 2. Ambil Semua Pegawai - Endpoint: /users
// ============================================================================
export async function getEmployees() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users`, {
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
// 3. Ambil Detail Pegawai Spesifik - Endpoint: /users/:id
// ============================================================================
export async function getEmployeeById(id: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users/${id}`, {
      cache: "no-store",
      headers,
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil detail pegawai",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 4. Buat Pegawai Baru - Endpoint: /users (POST)
// ============================================================================
export async function createEmployee(payload: any) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      revalidatePath("/pegawai");
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menyimpan data pegawai.",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 5. Update Data Pegawai (Admin View) - Endpoint: /users/:id (PUT)
// ============================================================================
export async function updateEmployee(id: string, payload: any) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      revalidatePath("/pegawai");
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal memperbarui data.",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 6. Hapus Pegawai - Endpoint: /users/:id (DELETE)
// ============================================================================
export async function deleteEmployee(id: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();

    if (data.success) {
      revalidatePath("/pegawai");
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menghapus pegawai.",
      errorDetail: error.message,
    };
  }
}

// ============================================================================
// 7. Update Profil Mandiri (User View) - Endpoint: /users/:id/profile (PUT)
// ============================================================================
export async function updateSelfProfile(id: string, payload: any) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/users/${id}/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      revalidatePath("/profile");
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menyimpan data profil ke server.",
      errorDetail: error.message,
    };
  }
}
