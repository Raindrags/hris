import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// =====================================================================
// FUNGSI UTAMA PROXY REQUEST (Menangani GET, POST, PUT, DELETE, dll)
// =====================================================================
async function handleRequest(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  try {
    // 1. Resolve Promise dari params (PERBAIKAN ERROR "params is a Promise")
    const resolvedParams = await params;

    // Mengambil path dinamis (misal: 'stats', 'complaints', atau 'logs')
    const path = resolvedParams.slug.join("/");

    // 2. Meneruskan parameter query (misal: ?status=PENDING)
    const url = new URL(req.url);
    const queryString = url.search;

    // 3. Susun URL Backend
    // Ganti "BACKEND_API_URL" dengan base URL NestJS Anda di .env
    const targetUrl = `${process.env.BACKEND_API_URL}/it-helpdesk/admin/${path}${queryString}`;

    // 4. Ambil Token dan Susun Headers
    const cookieStore = await cookies(); // Menggunakan await (wajib di Next.js 15+)
    const token = cookieStore.get("access_token")?.value;

    const headers = new Headers();

    // Teruskan Content-Type asli dari client jika ada (penting untuk POST/PUT JSON)
    const contentType = req.headers.get("Content-Type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    // Suntikkan token ke header
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // 5. Konfigurasi Fetch
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: headers,
    };

    // Jika method bukan GET atau HEAD, teruskan body request-nya
    if (req.method !== "GET" && req.method !== "HEAD") {
      const bodyText = await req.text(); // Ambil body sebagai string raw
      if (bodyText) {
        fetchOptions.body = bodyText;
      }
    }

    // 6. Tembak ke Backend (NestJS)
    const backendResponse = await fetch(targetUrl, fetchOptions);

    // 7. Parsing Hasil Respons
    const data = await backendResponse.text();
    let jsonResponse;

    // Coba parsing sebagai JSON, jika gagal kembalikan sebagai text (mencegah crash)
    try {
      jsonResponse = data ? JSON.parse(data) : {};
    } catch (e) {
      jsonResponse = data;
    }

    return NextResponse.json(jsonResponse, { status: backendResponse.status });
  } catch (error: any) {
    console.error(`Proxy Admin IT-Helpdesk Error:`, error.message);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan internal pada proxy Next.js",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// =====================================================================
// EXPORT METHODS
// =====================================================================

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  return handleRequest(req, context);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  return handleRequest(req, context);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  return handleRequest(req, context);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  return handleRequest(req, context);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  return handleRequest(req, context);
}
