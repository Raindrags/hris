const NEXT_PUBLIC_API_URL =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

// Fungsi pembantu untuk membaca cookie di sisi Client
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

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

  const token = getCookie("access_token");

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Terjadi kesalahan pada server");
  }

  return response.json();
}
