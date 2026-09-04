"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useDashboard } from "./hooks/useDashboard";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { RecentRequestsList } from "./components/RecentRequestsList";

import { ProfileForm } from "@/app/components/forms/profile-form";
import { ApprovalSection } from "@/app/components/forms/approval-section";

export default function PegawaiDashboardPage() {
  const { states, actions } = useDashboard();
  const {
    loading,
    userData,
    recentRequests,
    incomingRequests,
    potentialSubstitutes,
    attendanceSummary,
    currentUser,
    deductionSummary,
  } = states;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-300">Memuat dashboard...</div>
      </main>
    );
  }

  if (!userData || !currentUser) {
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
          <ProfileForm user={userData} />
        </div>
      </main>
    );
  }

  // ✅ PERBAIKAN LOGIKA: Sekarang mengecek langsung dari properti hasSubordinates
  const isSupervisor = userData.hasSubordinates;

  return (
    <main className="min-h-screen bg-gray-950 p-6 md:p-10 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <DashboardHeader userName={userData.name} isGuru={userData.isGuru} />

          {/* Tombol ini sekarang HANYA muncul jika isSupervisor bernilai true */}
          {isSupervisor && (
            <Link
              href="/pegawai/dashboard/laporan-tim"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Laporan Rekap Tim
            </Link>
          )}
        </div>

        <DashboardStats
          userData={userData}
          attendanceSummary={attendanceSummary}
          deductionSummary={deductionSummary}
        />

        <ApprovalSection
          incomingRequests={incomingRequests}
          potentialSubstitutes={potentialSubstitutes}
          onRefresh={actions.refreshData}
        />
        <RecentRequestsList requests={recentRequests} />
      </div>
    </main>
  );
}
