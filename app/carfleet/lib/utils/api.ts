const NEXT_PUBLIC_API_URL =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${NEXT_PUBLIC_API_URL}${endpoint}`;

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

  // ✨ Perhatikan: tidak ada lagi credentials: "include"
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Terjadi kesalahan pada server");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
