const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3434";

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Tangani error seperti 401 (Unauthorized)
      if (response.status === 401) {
        // Optional: Redirect ke login atau bersihkan storage
        // window.location.href = '/login';
      }
      throw new Error(data.message || "Terjadi kesalahan pada server");
    }

    return {
      success: true,
      data: data.data || data,
      divisions: data.divisions,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const apiClient = {
  get: (url: string) => fetcher(url, { method: "GET" }),
  post: (url: string, body: any) =>
    fetcher(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url: string, body: any) =>
    fetcher(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url: string) => fetcher(url, { method: "DELETE" }),
};

export async function verifyToken(token: string) {
  const res = await fetch("/api/auth/verify-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Verifikasi gagal");
  return data.user;
}
