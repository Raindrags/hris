// app/actions/special-workdate-action.ts
"use server";

const API_BASE = process.env.BACKEND_API_URL;

export async function getSpecialWorkDates() {
  console.log("=== SERVER ACTION: MEMULAI GET DATA ===");
  try {
    const res = await fetch(`${API_BASE}/special-workdates`, {
      cache: "no-store",
    });

    const result = await res.json();
    console.log("=== SERVER ACTION: GET DATA BERHASIL ===", result);

    // Pastikan format return selalu seragam agar frontend tidak bingung
    if (Array.isArray(result)) {
      return { success: true, data: result };
    }
    return { success: true, data: result.data || result };
  } catch (error) {
    console.error("getSpecialWorkDates error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function createSpecialWorkDate(formData: {
  date: string;
  reason: string;
  checkIn?: string | null;
  checkOut?: string | null;
}) {
  console.log("=== SERVER ACTION: MEMULAI CREATE DATA ===");
  console.log("Data mentah dari frontend:", formData);

  try {
    // PEMETAAN & SANITISASI JAM KOSONG
    // Jika string kosong ("") atau null, paksa jadi "00:00" agar lolos validasi format jam di API utama
    const apiPayload = {
      date: formData.date,
      reason: formData.reason || "Hari Kerja Khusus",
      checkIn:
        formData.checkIn && formData.checkIn.trim() !== ""
          ? formData.checkIn
          : "00:00",
      checkOut:
        formData.checkOut && formData.checkOut.trim() !== ""
          ? formData.checkOut
          : "00:00",
      divisiId: null,
      userIds: null,
    };

    console.log("Payload siap tembak ke API Utama:", apiPayload);

    const res = await fetch(`${API_BASE}/special-workdates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    const result = await res.json();
    console.log("=== SERVER ACTION: API UTAMA MERESPON CREATE ===", result);

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Gagal menyimpan data ke API utama",
      };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("createSpecialWorkDate error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function updateSpecialWorkDate(
  id: string,
  formData: Partial<{
    date: string;
    reason: string;
    checkIn: string | null;
    checkOut: string | null;
  }>,
) {
  console.log(`=== SERVER ACTION: MEMULAI UPDATE DATA (ID: ${id}) ===`);
  console.log("Data parsial dari frontend:", formData);

  try {
    // PEMETAAN & SANITISASI JAM KOSONG UNTUK UPDATE
    const apiPayload: any = {};

    if (formData.date) apiPayload.date = formData.date;
    if (formData.reason) apiPayload.reason = formData.reason;

    // Amankan Jam Mulai jika dikirim oleh frontend
    if (formData.checkIn !== undefined) {
      apiPayload.checkIn =
        formData.checkIn && formData.checkIn.trim() !== ""
          ? formData.checkIn
          : "00:00";
    }

    // Amankan Jam Selesai jika dikirim oleh frontend
    if (formData.checkOut !== undefined) {
      apiPayload.checkOut =
        formData.checkOut && formData.checkOut.trim() !== ""
          ? formData.checkOut
          : "00:00";
    }

    console.log(
      "Payload parsial siap tembak ke API Utama (PATCH):",
      apiPayload,
    );

    const res = await fetch(`${API_BASE}/special-workdates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    const result = await res.json();
    console.log("=== SERVER ACTION: API UTAMA MERESPON UPDATE ===", result);

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Gagal memperbarui data di API utama",
      };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("updateSpecialWorkDate error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}

export async function deleteSpecialWorkDate(id: string) {
  console.log(`=== SERVER ACTION: MEMULAI DELETE DATA (ID: ${id}) ===`);
  try {
    const res = await fetch(`${API_BASE}/special-workdates/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();
    console.log("=== SERVER ACTION: API UTAMA MERESPON DELETE ===", result);

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Gagal menghapus data di API utama",
      };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("deleteSpecialWorkDate error:", error);
    return { success: false, error: "Gagal terhubung ke server" };
  }
}
