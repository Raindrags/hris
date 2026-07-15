// app/pegawai/dashboard/page.tsx
"use client";

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
    console.log("ISI USER DATA:", userData);
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

  return (
    <main className="min-h-screen bg-gray-950 p-6 md:p-10 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <DashboardHeader userName={userData.name} />
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
