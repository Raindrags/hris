"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyToken } from "@/lib/api-client";

export default function WaLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token tidak ditemukan.");
      return;
    }

    const doVerify = async () => {
      try {
        const user = await verifyToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        router.replace("/dashboard");
      } catch (err: any) {
        setError(err.message || "Token tidak valid.");
      }
    };

    doVerify();
  }, [token, router]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Memverifikasi token...</div>;
}
