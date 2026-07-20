"use server";

const API_BASE =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

export async function getHolidays() {
  try {
    const res = await fetch(`${API_BASE}/holidays`, { cache: "no-store" });
    return await res.json();
  } catch (error) {
    console.error("getHolidays error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

// ✨ Kita perlebar tipe datanya agar menerima field 'date' atau ID tambahan
export async function createHoliday(data: any) {
  try {
    console.log("🚀 MENGIRIM DATA KE BACKEND:", JSON.stringify(data));

    const res = await fetch(`${API_BASE}/holidays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Kita intip respon mentahnya sebelum diubah jadi JSON
    const textResponse = await res.text();
    console.log(`📥 STATUS DARI BACKEND: ${res.status}`);
    console.log(`📥 JAWABAN MENTAH BACKEND:`, textResponse);

    // Kalau sukses, kita kembalikan JSON-nya
    if (res.ok) {
      return JSON.parse(textResponse);
    }

    // Kalau gagal (misal 404), paksa kirim error
    return {
      success: false,
      error: textResponse.includes("notfound")
        ? "Endpoint API /holiday tidak ditemukan di server HRIS!"
        : "Terjadi kesalahan di server utama",
    };
  } catch (error) {
    console.error("createHoliday error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function updateHoliday(id: string, data: any) {
  try {
    const res = await fetch(`${API_BASE}/holidays/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const textResponse = await res.text();
    if (!res.ok) {
      console.error(`Update Error Status ${res.status}:`, textResponse);
      return { success: false, error: "Gagal update data di backend" };
    }

    return JSON.parse(textResponse);
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
