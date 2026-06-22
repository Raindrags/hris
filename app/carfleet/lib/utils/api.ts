// src/utils/api.ts
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${NEXT_PUBLIC_API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Terjadi kesalahan pada server');
  }

  return response.json();
}