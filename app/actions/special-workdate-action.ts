export async function createSpecialWorkDate(formData: {
  name: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
}) {
  try {
    // Sesuaikan payload dengan struktur baru backend NestJS
    const apiPayload = {
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime || null,
      endTime: formData.endTime || null,
    };

    const res = await fetch(`${API_BASE}/special-workdates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    const result = await res.json();

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
    name: string;
    startDate: string;
    endDate: string;
    startTime: string | null;
    endTime: string | null;
    userIds: string[] | null;
  }>,
) {
  try {
    const apiPayload: any = {};

    if (formData.name) apiPayload.name = formData.name;
    if (formData.startDate) apiPayload.startDate = formData.startDate;
    if (formData.endDate) apiPayload.endDate = formData.endDate;

    // Pastikan menangani startTime dan endTime jika dikirim
    if (formData.startTime !== undefined)
      apiPayload.startTime = formData.startTime || null;
    if (formData.endTime !== undefined)
      apiPayload.endTime = formData.endTime || null;
    if (formData.userIds !== undefined) apiPayload.userIds = formData.userIds;

    const res = await fetch(`${API_BASE}/special-workdates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    const result = await res.json();

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
