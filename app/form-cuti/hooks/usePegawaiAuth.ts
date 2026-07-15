import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface PegawaiAuthData {
  sisaCuti: number;
  [key: string]: any; // Tambahkan ini agar bisa menampung data lain
}

export const usePegawaiAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<PegawaiAuthData | null>(null);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        if (token) {
          // Mode Magic Link (Token URL)
          const res = await fetch("/api/auth/verify-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            cache: "no-store", // Wajib anti-cache
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || "Token tidak valid atau kadaluarsa.");
          }

          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
          }

          // Smart Extractor
          const userObj = data.user?.data || data.user;
          setUserData({
            ...userObj,
            sisaCuti: userObj?.sisaCuti ?? 0,
          });
        } else {
          // Mode Akses Langsung (Cookie Session)
          const meRes = await fetch("/api/auth/me", {
            // Mencegah Next.js / Browser melakukan cache data basi
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });

          if (meRes.status === 401) {
            throw new Error("Anda belum login. Silakan login via WhatsApp.");
          }

          const meData = await meRes.json();
          console.log("=== DATA FRESH DARI BROWSER ===", meData); // Cek konsol browser

          // Smart Extractor: Jaga-jaga NestJS membungkus data dalam properti 'data'
          const userObj = meData.user?.data || meData.user || {};

          setUserData({
            ...userObj,
            sisaCuti: userObj?.sisaCuti ?? 0,
          });
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memverifikasi sesi.");
      } finally {
        setLoading(false);
      }
    };

    authenticateUser();
  }, [token]);

  const handleSuccess = () => {
    router.push("/pegawai/dashboard");
  };

  const handleBack = () => {
    router.push("/pegawai/dashboard");
  };

  return { loading, error, userData, handleSuccess, handleBack };
};
