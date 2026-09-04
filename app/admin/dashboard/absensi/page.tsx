"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
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

  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    emp: any | null;
  }>({ isOpen: false, emp: null });
  const [warningForm, setWarningForm] = useState({
    level: "TEGURAN_1",
    category: "KEHADIRAN",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openWarningModal = (emp: any) => {
    // Ambil semua log keterlambatan dan alpa
    const issueLogs = emp.logs.filter(
      (log: any) =>
        log.status === "LATE" ||
        log.lateDuration !== "-" ||
        log.isAbsent ||
        log.status?.toLowerCase() === "alpha",
    );

    const issueText = issueLogs
      .map((l: any) =>
        l.isAbsent
          ? `${l.date} (Alpha)`
          : `${l.date} (Telat: ${l.lateDuration})`,
      )
      .join(", ");

    const autoDesc =
      issueLogs.length > 0
        ? `Berdasarkan rekapitulasi data absensi, pegawai yang bersangkutan telah melakukan pelanggaran kehadiran sebanyak ${issueLogs.length} kali pada periode berjalan. Rincian tanggal: ${issueText}.`
        : "";

    setWarningForm({
      level: "TEGURAN_1",
      category: "KEHADIRAN",
      description: autoDesc,
    });
    setWarningModal({ isOpen: true, emp });
  };

  const handleSubmitWarning = async () => {
    if (!warningForm.description)
      return alert("Detail pelanggaran wajib diisi!");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/warnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: warningModal.emp?.id, // Akan merujuk ke tabel User (userId) via backend
          level: warningForm.level,
          category: warningForm.category,
          description: warningForm.description,
          issuerName: "Admin HRD",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Surat Peringatan berhasil disimpan!");
        setWarningModal({ isOpen: false, emp: null });
      } else {
        alert("Gagal menyimpan: " + data.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    if (dataToExport.length === 0)
      return alert("Tidak ada data untuk diekspor.");
    try {
      await exportAttendanceToExcel(
        dataToExport,
        state.startDate,
        state.endDate,
      );
    } catch (error) {
      console.error("Export gagal:", error);
      alert("Terjadi kesalahan saat mengexport Excel.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20 text-gray-100">
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
          className="bg-emerald-600/20 text-emerald-300 border-emerald-700/50 hover:bg-emerald-600/30"
        >
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </header>

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
                className="pl-9 bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
              />
            </div>
            <div className="text-sm text-gray-400">
              Menampilkan {state.filteredReportData.length} pegawai
            </div>
          </div>

          <div className="space-y-8">
            {state.paginatedData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-900/50 border border-gray-800 rounded-lg">
                <p>Tidak ada pegawai yang cocok.</p>
              </div>
            ) : (
              state.paginatedData.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  emp={emp}
                  onOpenWarning={() => openWarningModal(emp)}
                />
              ))
            )}
          </div>

          {state.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-8">
              <p className="text-sm text-gray-400">
                Halaman {state.currentPage} dari {state.totalPages}
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

      {/* Modal SP */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-amber-500 w-5 h-5" />
                Buat Surat Peringatan
              </h3>
              <button
                onClick={() => setWarningModal({ isOpen: false, emp: null })}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <Label className="text-gray-400 text-xs">Pegawai</Label>
                <div className="text-white font-semibold mt-1 bg-gray-800 px-3 py-2 rounded-md border border-gray-700">
                  {warningModal.emp?.name} - {warningModal.emp?.niy}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Tingkat Peringatan</Label>
                  <Select
                    value={warningForm.level}
                    onValueChange={(v) =>
                      setWarningForm({ ...warningForm, level: v })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="TEGURAN_1">ST 1</SelectItem>
                      <SelectItem value="TEGURAN_2">ST 2</SelectItem>
                      <SelectItem value="TEGURAN_3">ST 3</SelectItem>
                      <SelectItem value="SP_1">SP 1</SelectItem>
                      <SelectItem value="SP_2">SP 2</SelectItem>
                      <SelectItem value="SP_3">SP 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Kategori</Label>
                  <Select
                    value={warningForm.category}
                    onValueChange={(v) => {
                      const newDesc =
                        v === "KEHADIRAN" ? warningForm.description : "";
                      setWarningForm({
                        ...warningForm,
                        category: v,
                        description: newDesc,
                      });
                    }}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="KEHADIRAN">
                        Kehadiran (Otomatis)
                      </SelectItem>
                      <SelectItem value="LAINNYA">
                        Lainnya (Input Manual)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Detail Pelanggaran</Label>
                <textarea
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  value={warningForm.description}
                  onChange={(e) =>
                    setWarningForm({
                      ...warningForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Tuliskan kronologi atau detail pelanggaran..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-800 bg-gray-900/50">
              <Button
                variant="ghost"
                onClick={() => setWarningModal({ isOpen: false, emp: null })}
                className="text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitWarning}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Peringatan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
