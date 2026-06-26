const NEXT_PUBLIC_API_URL =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

// Fungsi pembantu untuk membaca cookie di sisi Client
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
  return null;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${NEXT_PUBLIC_API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getCookie("access_token");
  console.log("DEBUG COOKIE TOKEN:", token);

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Terjadi kesalahan pada server");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};

  return response.json();
}
