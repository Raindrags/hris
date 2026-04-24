"use server";

import { cookies } from "next/headers";

const API_BASE =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

export async function getUsers() {
  const url = `${API_BASE}/users`;
  const token = (await cookies()).get("access_token")?.value;

  console.log(`[getUsers] Memanggil: ${url}`);

  if (!token) {
    console.warn("[getUsers] Token tidak tersedia di cookie");
    return { success: false, error: "Tidak terautentikasi", data: [] };
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`[getUsers] Error:`, error);
    return { success: false, error: "Gagal terhubung ke server", data: [] };
  }
}
