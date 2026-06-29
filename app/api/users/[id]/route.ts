import { NextRequest, NextResponse } from "next/server";

// ==========================================
// 1. GET USER DETAIL
// ==========================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Ekstrak id dari params dengan await (Standar Next.js 15)
  const { id } = await params;

  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    // Mengirim permintaan ke backend NestJS
    const res = await fetch(`${backendUrl}/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const backendData = await res.json();

    // Jika backend mengembalikan error (misal 404 / 401)
    if (!res.ok) {
      console.error(`[API /users/${id}] ❌ Backend error:`, backendData);
      return NextResponse.json(backendData, { status: res.status });
    }

    // ✅ PERBAIKAN: Menggunakan backendData.data sesuai format return NestJS Anda
    // Menggunakan ?. (Optional Chaining) agar aman jika data kosong
    console.log("sisaCuti from backend:", backendData.data?.sisaCuti);

    // Kirim data utuh ke frontend Next.js
    return NextResponse.json(backendData, { status: res.status });
  } catch (error: any) {
    console.error("Error fetching user detail:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat mengambil data" },
      { status: 500 },
    );
  }
}

// ==========================================
// 2. UPDATE USER (PUT)
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();

    // 🔍 Log payload yang dikirim ke backend
    console.log(
      `[API /users/${id}] 📤 Payload dikirim ke backend:`,
      JSON.stringify(body, null, 2),
    );

    const res = await fetch(`${backendUrl}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const backendData = await res.json();

    // 🔍 Log respons dari backend
    if (!res.ok) {
      console.error(
        `[API /users/${id}] ❌ Backend error ${res.status}:`,
        JSON.stringify(backendData, null, 2),
      );
    } else {
      console.log(
        `[API /users/${id}] ✅ Backend sukses mengupdate:`,
        JSON.stringify(backendData, null, 2),
      );
    }

    return NextResponse.json(backendData, { status: res.status });
  } catch (error) {
    console.error(`[API /users/${id}] 💥 Server error saat update:`, error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat memperbarui data" },
      { status: 500 },
    );
  }
}

// ==========================================
// 3. DELETE USER
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    // 🔍 Log info bahwa proses hapus dimulai
    console.log(
      `[API /users/${id}] 🗑️ Meminta backend untuk menghapus data...`,
    );

    const res = await fetch(`${backendUrl}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const backendData = await res.json();

    if (!res.ok) {
      console.error(
        `[API /users/${id}] ❌ Backend error saat delete ${res.status}:`,
        JSON.stringify(backendData, null, 2),
      );
    } else {
      console.log(
        `[API /users/${id}] ✅ Backend sukses menghapus data:`,
        JSON.stringify(backendData, null, 2),
      );
    }

    return NextResponse.json(backendData, { status: res.status });
  } catch (error) {
    console.error(`[API /users/${id}] 💥 Server error saat delete:`, error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat menghapus data" },
      { status: 500 },
    );
  }
}