const NEXT_PUBLIC_API_URL =
  process.env.BACKEND_API_URL || "https://hris.maitreyawirads.dpdns.org";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${NEXT_PUBLIC_API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Kita beritahu fetch untuk otomatis menempelkan cookie bawaan browser
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Terjadi kesalahan pada server");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
