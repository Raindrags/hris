import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  User,
  CheckCircle,
  AlertCircle,
  Calculator,
} from "lucide-react";
import { DashboardStatsProps } from "../types";

export const DashboardStats = ({
  userData,
  attendanceSummary,
  deductionSummary,
}: DashboardStatsProps) => {
  const safeDeduction = deductionSummary || {
    transportCount: 0,
    konsumsiCount: 0,
    gajiCount: 0,
    shiftCount: 0,
    shiftRate: 0,
    shiftTotal: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {/* ========================================= */}
      {/* 1. Card Sisa Cuti */}
      {/* ========================================= */}
      <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Sisa Cuti
          </CardTitle>
          <CalendarDays className="h-5 w-5 text-crimson-500" />
        </CardHeader>
        <CardContent>
          {userData.isGuru ? (
            <div className="text-sm font-medium text-gray-500 mt-1 italic">
              Tidak ada jatah cuti untuk guru.
            </div>
          ) : (
            <div className="text-3xl font-bold text-white">
              {userData.sisaCuti ?? 0} Hari
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================= */}
      {/* 2. Card Atasan */}
      {/* ========================================= */}
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

      {attendanceSummary && (
        <>
          {/* ========================================= */}
          {/* 3. Card Kehadiran Bulan Ini */}
          {/* ========================================= */}
          <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Kehadiran Bulan Ini
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {attendanceSummary.onTime}
                  </p>
                  <p className="text-xs text-gray-500">Tepat</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">
                    {attendanceSummary.late}
                  </p>
                  <p className="text-xs text-gray-500">Telat</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {attendanceSummary.earlyLeaves}
                  </p>
                  <p className="text-xs text-gray-500">Pulang Awal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========================================= */}
          {/* 4. Card Ketidakhadiran */}
          {/* ========================================= */}
          <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Ketidakhadiran
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {attendanceSummary.izin}
                  </p>
                  <p className="text-xs text-gray-500">Izin</p>
                </div>

                {/* Rincian Cuti (Hanya Tampil Jika BUKAN Guru) */}
                {!userData.isGuru && (
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      {attendanceSummary.cuti}
                    </p>
                    <p className="text-xs text-gray-500">Cuti</p>
                  </div>
                )}

                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {attendanceSummary.off}
                  </p>
                  <p className="text-xs text-gray-500">Off/Holiday</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ========================================= */}
      {/* 5. Card Ringkasan Potongan */}
      {/* ========================================= */}
      <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Ringkasan Potongan
          </CardTitle>
          <Calculator className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 text-sm text-gray-300 mt-1">
            <div className="flex justify-between items-center border-b border-gray-800 pb-1">
              <span>Tunj. Transportasi</span>
              <span className="font-semibold text-white">
                {safeDeduction.transportCount} kali
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-1">
              <span>Tunj. Konsumsi</span>
              <span className="font-semibold text-white">
                {safeDeduction.konsumsiCount} kali
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-1">
              <span>Gaji Pokok</span>
              <span className="font-semibold text-white">
                {safeDeduction.gajiCount} kali
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span>Shift</span>
              <span className="text-xs">
                {safeDeduction.shiftCount} x {safeDeduction.shiftRate} ={" "}
                <span className="font-bold text-red-400 text-sm ml-1">
                  {safeDeduction.shiftTotal}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
