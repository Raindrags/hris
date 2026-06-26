export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // 🚀 1. KUNCI UTAMA: Kita paksa semua request masuk ke rute proxy lokal
  // Middleware akan menangkap awalan '/api/proxy' ini
  const url = `/api/proxy${endpoint}`;

  // 🚀 2. Siapkan header standar
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("token");
    if (localToken) {
      headers["Authorization"] = `Bearer ${localToken}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // 🚀 4. TANGKAP ERROR
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Error ${response.status}: Terjadi kesalahan pada server`,
    );
  }

  // 🚀 5. KEMBALIKAN DATA
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
