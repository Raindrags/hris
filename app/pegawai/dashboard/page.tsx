"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, User } from "lucide-react";

// Import server action yang sudah dibuat
import { ApprovalRequestData } from "@/app/components/forms/approval-form";
import { ApprovalSection } from "@/app/components/forms/approval-section";
import { ProfileForm } from "@/app/components/forms/profile-form";
import { getDashboardData } from "@/app/actions/dashboard-action";

// Helper Format Tanggal
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

interface UserData {
  name: string;
  sisaCuti: number;
  jatahCuti: number;
  isFirstLogin: boolean;
  supervisor: { name: string } | null;
}

interface RecentRequest {
  id: string;
  type: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
}

export default function PegawaiDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<
    ApprovalRequestData[]
  >([]);
  const [potentialSubstitutes, setPotentialSubstitutes] = useState<any[]>([]);

  // State untuk menyimpan data user dari endpoint /api/auth/me
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Cek autentikasi via cookie httpOnly
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          router.push("/login?message=silakan_login_via_whatsapp");
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login?message=silakan_login_via_whatsapp");
      }
    };
    checkAuth();
  }, [router]);

  // Ambil data dashboard menggunakan server action
  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData();

        // Debug: log di console browser
        console.log("[DEBUG] Dashboard data received:", data);

        if (!data.success) {
          console.error("[DEBUG] Dashboard fetch failed:", data.error);
          // Tampilkan pesan error
          setUserData(null);
          setLoading(false);
          return;
        }

        setUserData(data.user);
        setRecentRequests(data.recentRequests || []);
        setIncomingRequests(data.incomingRequests || []);
        setPotentialSubstitutes(data.potentialSubstitutes || []);
      } catch (error) {
        console.error("[DEBUG] Dashboard fetch exception:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-300">Memuat dashboard...</div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 bg-gray-900 p-4 rounded border border-red-900">
          Gagal memuat data pengguna.
        </div>
      </main>
    );
  }

  if (userData.isFirstLogin) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Selamat Datang!
          </h1>
          <ProfileForm user={currentUser} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-6 md:p-10 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Halo, {userData.name}!
            </h1>
            <p className="text-gray-400 mt-1">
              Selamat datang di Dashboard Kepegawaian.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/pegawai/form-izin">
              <Button
                variant="outline"
                className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" /> Izin
              </Button>
            </Link>
            <Link href="/pegawai/form-cuti">
              <Button className="bg-crimson-700 hover:bg-crimson-800 text-white shadow-md shadow-crimson-900/30">
                <CalendarDays className="h-4 w-4 mr-2" /> Cuti
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Sisa Cuti
              </CardTitle>
              <CalendarDays className="h-5 w-5 text-crimson-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {userData.sisaCuti ?? 0} Hari
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Atasan
              </CardTitle>
              <User className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate text-white">
                {userData.supervisor?.name || "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Approval Bawahan */}
        <ApprovalSection
          incomingRequests={incomingRequests}
          potentialSubstitutes={potentialSubstitutes}
        />

        {/* Riwayat Pribadi */}
        <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Riwayat Pengajuan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-800 rounded-lg">
                Belum ada riwayat.
              </p>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row justify-between p-4 border border-gray-800 bg-gray-950 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 font-semibold text-white">
                        {req.type}{" "}
                        {req.status === "APPROVED"
                          ? "✅"
                          : req.status === "REJECTED"
                            ? "❌"
                            : "⏳"}
                      </div>
                      <p className="text-sm text-gray-400">
                        {formatDate(req.startDate)} - {formatDate(req.endDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
