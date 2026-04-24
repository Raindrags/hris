"use server";

const API_BASE =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

export async function getDivisions() {
  try {
    const res = await fetch(`${API_BASE}/divisions`, { cache: "no-store" });
    return await res.json();
  } catch (error) {
    console.error("getUsers error:", error);
    return { success: false, error: "Gagal terhubung ke server", data: [] };
  }
}
