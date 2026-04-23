"use server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function getHolidays() {
  try {
    const res = await fetch(`${API_BASE}/holidays`, { cache: "no-store" });
    return await res.json();
  } catch (error) {
    console.error("getHolidays error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function createHoliday(data: {
  date: string;
  description: string;
  userIds?: string[] | null;
}) {
  try {
    const res = await fetch(`${API_BASE}/holidays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("createHoliday error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function updateHoliday(
  id: string,
  data: { date?: string; description?: string; userIds?: string[] | null },
) {
  try {
    const res = await fetch(`${API_BASE}/holidays/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("updateHoliday error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function deleteHoliday(id: string) {
  try {
    const res = await fetch(`${API_BASE}/holidays/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("deleteHoliday error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}
