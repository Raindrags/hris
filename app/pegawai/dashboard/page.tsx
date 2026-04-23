"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, User } from "lucide-react";
import { ApprovalSection } from "../../components/forms/approval-section";
import { ApprovalRequestData } from "../../components/forms/approval-form";
import { ProfileForm } from "../../components/forms/profile-form";

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

  // Ambil data user dari localStorage (hasil magic link)
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/login?message=silakan_login_via_whatsapp");
        return;
      }
      const data = await res.json();
      setCurrentUser(data.user);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        // Panggil API backend untuk data dashboard
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pegawai/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
            },
          },
        );

        if (!res.ok) throw new Error("Gagal memuat data");

        const data = await res.json();

        setUserData(data.user);
        setRecentRequests(data.recentRequests || []);
        setIncomingRequests(data.incomingRequests || []);
        setPotentialSubstitutes(data.potentialSubstitutes || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        // Bisa tampilkan toast error di sini
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-100">Memuat dashboard...</div>
      </main>
    );
  }

  if (!userData) {
    return null; // atau tampilkan pesan error
  }

  if (userData.isFirstLogin) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang!
          </h1>
          <ProfileForm user={currentUser} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-6 md:p-10 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Halo, {userData.name}!</h1>
            <p className="text-slate-400">
              Selamat datang di Dashboard Kepegawaian.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/pegawai/form-izin">
              <Button variant="outline" className="bg-white text-slate-900">
                <FileText className="h-4 w-4 mr-2" /> Izin
              </Button>
            </Link>
            <Link href="/pegawai/form-cuti">
              <Button className="bg-blue-600">
                <CalendarDays className="h-4 w-4 mr-2" /> Cuti
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-800 bg-slate-800/50 text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Sisa Cuti</CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userData.sisaCuti ?? 0} Hari
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-800/50 text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Atasan</CardTitle>
              <User className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">
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
        <Card className="border-slate-800 bg-slate-800/50 text-slate-100">
          <CardHeader>
            <CardTitle>Riwayat Pengajuan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                Belum ada riwayat.
              </p>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row justify-between p-4 border border-slate-700 bg-slate-800 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 font-semibold">
                        {req.type}{" "}
                        {req.status === "APPROVED"
                          ? "✅"
                          : req.status === "REJECTED"
                            ? "❌"
                            : "⏳"}
                      </div>
                      <p className="text-sm text-slate-400">
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
