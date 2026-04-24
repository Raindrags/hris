"use server";

const API_BASE =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

export async function getHolidays() {
  try {
    const res = await fetch(`${API_BASE}/holiday`, { cache: "no-store" });
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
    const res = await fetch(`${API_BASE}/holiday`, {
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
    const res = await fetch(`${API_BASE}/holiday/${id}`, {
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
    const res = await fetch(`${API_BASE}/holiday/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("deleteHoliday error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}
