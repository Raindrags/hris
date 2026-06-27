"use client";

import {
  Calendar,
  Clock,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportAttendanceToExcel } from "@/lib/excel-helper";

import { useAttendanceReport } from "./hooks/useAttendanceReport";
import { EmployeeCard } from "./components/EmployeeCard";

export default function RekapAbsensiView() {
  const { state, actions } = useAttendanceReport();
  const selectedDivisionName =
    state.divisiId === "all"
      ? "Semua Divisi"
      : state.divisions.find((div) => String(div.id) === String(state.divisiId))
          ?.name || "Pilih Divisi";

  const handleExportExcel = async () => {
    const dataToExport =
      state.filteredReportData.length > 0
        ? state.filteredReportData
        : state.reportData;
    if (dataToExport.length === 0) {
      alert(
        "Tidak ada data untuk diekspor. Silakan generate laporan terlebih dahulu.",
      );
      return;
    }
    try {
      await exportAttendanceToExcel(
        dataToExport,
        state.startDate,
        state.endDate,
      );
    } catch (error) {
      console.error("Export gagal:", error);
      alert(
        "Terjadi kesalahan saat mengexport Excel. Lihat konsol untuk detail.",
      );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20 text-gray-100">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Laporan Absensi
          </h1>
          <p className="text-gray-400 mt-1">
            Rekapitulasi kehadiran, keterlambatan, dan jam kerja pegawai.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={state.filteredReportData.length === 0 || state.isLoading}
          className="bg-emerald-600/20 text-emerald-300 border-emerald-700/50 hover:bg-emerald-600/30 hover:text-emerald-200"
        >
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </header>

      {/* Filter Section */}
      <Card className="bg-gray-900 border-gray-800 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label className="text-gray-300">Tanggal Mulai</Label>
              <Input
                type="date"
                value={state.startDate}
                onChange={(e) => actions.setStartDate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-gray-300">Tanggal Akhir</Label>
              <Input
                type="date"
                value={state.endDate}
                onChange={(e) => actions.setEndDate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-gray-300">Divisi / Unit</Label>
              <Select
                value={String(state.divisiId)}
                onValueChange={(v) => actions.setDivisiId(v ?? "all")}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  {/* Rahasianya di sini: Kita berikan selectedDivisionName sebagai 'children' ke SelectValue */}
                  <SelectValue placeholder="Pilih Divisi">
                    {selectedDivisionName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {state.divisions.map((div) => (
                    <SelectItem key={div.id} value={String(div.id)}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={actions.handleGenerateReport}
                disabled={state.isLoading}
                className="w-full h-10 bg-crimson-700 hover:bg-crimson-800 text-white"
              >
                {state.isLoading ? (
                  "Memproses..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" /> Tampilkan Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* States & Data Render */}
      {state.isLoading ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="w-10 h-10 animate-spin mx-auto mb-4 text-crimson-400" />
          <p>Sedang menarik data absensi dari server...</p>
        </div>
      ) : state.reportData.length === 0 ? (
        <Card className="border-dashed border-gray-800 bg-gray-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Calendar className="w-12 h-12 mb-4 text-gray-700" />
            <p>Belum ada data yang ditampilkan.</p>
            <p className="text-sm">
              Silakan atur filter dan klik &quot;Tampilkan Data&quot;.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 text-gray-400" />
              <Input
                placeholder="Cari nama atau NIY..."
                value={state.searchQuery}
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
              />
            </div>
            <div className="text-sm text-gray-400">
              Menampilkan {state.filteredReportData.length} pegawai
            </div>
          </div>

          <div className="space-y-8">
            {state.paginatedData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-gray-800 rounded-lg bg-gray-900/50">
                <p>
                  Tidak ada pegawai yang cocok dengan pencarian &quot;
                  {state.searchQuery}&quot;.
                </p>
              </div>
            ) : (
              state.paginatedData.map((emp) => (
                <EmployeeCard key={emp.id} emp={emp} />
              ))
            )}
          </div>

          {state.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-8">
              <p className="text-sm text-gray-400">
                Menampilkan halaman {state.currentPage} dari {state.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    actions.setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={state.currentPage === 1}
                  className="border-gray-700 bg-gray-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    actions.setCurrentPage((prev) =>
                      Math.min(prev + 1, state.totalPages),
                    )
                  }
                  disabled={state.currentPage === state.totalPages}
                  className="border-gray-700 bg-gray-800"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
