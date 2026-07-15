import { NextResponse } from "next/server";

// ============================================================================
// 1. GET METHOD (Hanya menampilkan UI Loading, memblokir Bot WA & Prefetch)
// ============================================================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Jika token tidak ada, langsung arahkan ke halaman error
  if (!token) {
    return NextResponse.redirect(
      new URL("/error?code=401&err=NoToken", request.url),
    );
  }

  // Render HTML murni dengan Script otomatis.
  // Bot WA dan Prefetcher (Chrome/Safari) tidak akan mengeksekusi JavaScript di bawah ini,
  // sehingga token aman 100% sampai layar benar-benar terbuka di HP user.
  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Memverifikasi Login...</title>
        <style>
            body { 
                background-color: #111827; 
                color: #ffffff; 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
            }
            .container {
                text-align: center;
                padding: 2rem;
                background-color: #1f2937;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .loader { 
                border: 4px solid #374151; 
                border-top: 4px solid #10b981; 
                border-radius: 50%; 
                width: 48px; 
                height: 48px; 
                animation: spin 1s linear infinite; 
                margin: 0 auto 16px auto; 
            }
            @keyframes spin { 
                0% { transform: rotate(0deg); } 
                100% { transform: rotate(360deg); } 
            }
            h2 { margin: 0 0 8px 0; font-size: 1.25rem; font-weight: 600; }
            p { color: #9ca3af; font-size: 0.875rem; margin: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="loader"></div>
            <h2>Sedang Memverifikasi...</h2>
            <p>Mohon tunggu, Anda sedang diarahkan ke Dashboard HRIS.</p>
        </div>
        <script>
            // Begitu halaman selesai dirender di browser user asli,
            // tembak request POST ke file ini sendiri untuk verifikasi ke NestJS.
            window.onload = function() {
                fetch(window.location.href, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.url) {
                        // Jika sukses diverifikasi, alihkan ke dashboard
                        window.location.replace(data.url);
                    } else {
                        // Jika token hangus / kadaluwarsa, alihkan ke halaman error
                        const errMsg = encodeURIComponent(data.error || 'Link tidak valid atau sudah kedaluwarsa');
                        window.location.replace('/error?code=401&err=' + errMsg);
                    }
                })
                .catch(err => {
                    console.error('Error saat verifikasi:', err);
                    window.location.replace('/error?code=500&err=NetworkError');
                });
            };
        </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

// ============================================================================
// 2. POST METHOD (Dipanggil oleh script HTML di atas untuk set Cookie & verifikasi)
// ============================================================================
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const redirectPath = searchParams.get("redirect") || "/pegawai/dashboard";

  try {
    // Tembak endpoint NestJS Anda
    const nestJsApiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://hris.maitreyawirads.dpdns.org";

    const verifyResponse = await fetch(`${nestJsApiUrl}/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await verifyResponse.json();

    // Jika verifikasi gagal di backend NestJS
    if (!verifyResponse.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Verifikasi token gagal di backend",
        },
        { status: 401 },
      );
    }

    // Jika sukses, buat response JSON yang akan dibaca oleh browser (script window.onload)
    const response = NextResponse.json({ success: true, url: redirectPath });

    // Tanamkan Token 7 Hari ke Cookie browser (Secure & HttpOnly)
    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    // Tanamkan Data User (Bisa dibaca oleh client-side React)
    if (data.user) {
      response.cookies.set(
        "user_data",
        JSON.stringify({
          name: data.user.name || "Pengguna",
          niy: data.user.niy || "-",
          role: data.user.role || "PEGAWAI",
          divisi: data.user.divisi || "-",
          sisaCuti: data.user.sisaCuti ?? 0,
        }),
        {
          httpOnly: false, // WAJIB FALSE agar bisa dibaca dari frontend
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        },
      );
    }

    // Tanamkan Role (Untuk keperluan Middleware)
    if (data.user?.role) {
      response.cookies.set("role", data.user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error("WA Login POST Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan pada server (Network/Backend)",
      },
      { status: 500 },
    );
  }
}
