// app/hooks/usePegawaiAuth.ts

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface PegawaiAuthData {
  sisaCuti: number;
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
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || "Token tidak valid atau kadaluarsa.");
          }

          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
          }

          setUserData({ sisaCuti: data.user.sisaCuti ?? 0 });
        } else {
          // Mode Akses Langsung (Cookie Session)
          const meRes = await fetch("/api/auth/me");
          if (meRes.status === 401) {
            throw new Error("Anda belum login. Silakan login via WhatsApp.");
          }

          const meData = await meRes.json();
          setUserData({ sisaCuti: meData.user?.sisaCuti ?? 0 });
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

  return {
    loading,
    error,
    userData,
    handleSuccess,
    handleBack,
  };
};
