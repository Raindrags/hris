"use server";

import { revalidatePath } from "next/cache";

async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`/api/users${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  return { status: res.status, data };
}

export async function getSupervisors() {
  try {
    const { status, data } = await fetchFromApi("/supervisors", {
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
    const { status, data } = await fetchFromApi("", { cache: "no-store" });
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
    const { status, data } = await fetchFromApi(`/${id}`, {
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
    const { status, data } = await fetchFromApi("", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (status >= 200 && status < 300) revalidatePath("/pegawai");
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
    const { status, data } = await fetchFromApi(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (status >= 200 && status < 300) revalidatePath("/pegawai");
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
    const { status, data } = await fetchFromApi(`/${id}`, {
      method: "DELETE",
    });
    if (status >= 200 && status < 300) revalidatePath("/pegawai");
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
    const { status, data } = await fetchFromApi(`/${id}/profile`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (status >= 200 && status < 300) revalidatePath("/profile");
    return { success: status >= 200 && status < 300, ...data };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menyimpan data profil ke server.",
      errorDetail: error.message,
    };
  }
}
