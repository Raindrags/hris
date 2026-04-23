// app/actions/special-workdate-action.ts
"use server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function getSpecialWorkDates() {
  try {
    const res = await fetch(`${API_BASE}/special-workdates`, {
      cache: "no-store",
    });
    return await res.json();
  } catch (error) {
    console.error("getSpecialWorkDates error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function createSpecialWorkDate(data: {
  date: string;
  reason?: string;
  checkIn: string;
  checkOut: string;
  divisiId?: string | null;
  userIds?: string[] | null;
}) {
  try {
    const res = await fetch(`${API_BASE}/special-workdates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("createSpecialWorkDate error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function updateSpecialWorkDate(
  id: string,
  data: Partial<{
    date: string;
    reason: string | null;
    checkIn: string;
    checkOut: string;
    divisiId: string | null;
    userIds: string[] | null;
  }>,
) {
  try {
    const res = await fetch(`${API_BASE}/special-workdates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("updateSpecialWorkDate error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function deleteSpecialWorkDate(id: string) {
  try {
    const res = await fetch(`${API_BASE}/special-workdates/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("deleteSpecialWorkDate error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}
