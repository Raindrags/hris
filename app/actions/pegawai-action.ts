"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE = process.env.BACKEND_API_URL;

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  return { status: res.status, data };
}

export async function getSupervisors() {
  try {
    const { status, data } = await fetchWithAuth("/users/supervisors", {
      cache: "no-store",
    });
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil data atasan",
      errorDetail: error.message,
    };
  }
}

export async function getEmployees() {
  try {
    const { status, data } = await fetchWithAuth("/users", {
      cache: "no-store",
    });
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil data pegawai",
      errorDetail: error.message,
    };
  }
}

export async function getEmployeeById(id: string) {
  try {
    const { status, data } = await fetchWithAuth(`/users/${id}`, {
      cache: "no-store",
    });
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      error: "Gagal mengambil detail pegawai",
      errorDetail: error.message,
    };
  }
}

export async function createEmployee(payload: any) {
  try {
    const { status, data } = await fetchWithAuth("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (status >= 200 && status < 300) {
      revalidatePath("/pegawai");
    }
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menyimpan data pegawai.",
      errorDetail: error.message,
    };
  }
}

export async function updateEmployee(id: string, payload: any) {
  try {
    const { status, data } = await fetchWithAuth(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (status >= 200 && status < 300) {
      revalidatePath("/pegawai");
    }
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal memperbarui data.",
      errorDetail: error.message,
    };
  }
}

export async function deleteEmployee(id: string) {
  try {
    const { status, data } = await fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    });
    if (status >= 200 && status < 300) {
      revalidatePath("/pegawai");
    }
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menghapus pegawai.",
      errorDetail: error.message,
    };
  }
}

export async function updateSelfProfile(id: string, payload: any) {
  try {
    const { status, data } = await fetchWithAuth(`/users/${id}/profile`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (status >= 200 && status < 300) {
      revalidatePath("/profile");
    }
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menyimpan data profil ke server.",
      errorDetail: error.message,
    };
  }
}
