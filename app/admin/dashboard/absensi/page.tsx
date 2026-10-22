"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  PlusCircle,
  Save,
  Users,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { exportAttendanceToExcel } from "@/lib/excel-helper";

import { useAttendanceReport } from "./hooks/useAttendanceReport";
import { EmployeeCard } from "./components/EmployeeCard";

// Mengambil fungsi fetch pegawai dari Server Action
import { getEmployeesForAssign } from "@/app/actions/jadwal-action";

// ✨ IMPORT API_BASE_URL AGAR TERHUBUNG KE BACKEND NESTJS
import { API_BASE_URL } from "./constants";

// Mock data Shift Template (Sesuaikan atau fetch dari backend)
const MOCK_SHIFTS = [
  { id: "1", name: "Guru Wfh", startTime: "07:30", endTime: "13:30" },
];

export default function RekapAbsensiView() {
  const { state, actions } = useAttendanceReport();

  // --- STATE UNTUK MANAJEMEN TAB ---
  const [activeTab, setActiveTab] = useState<"report" | "manual">("report");

  // --- STATE UNTUK LAPORAN (EXISTING) ---
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    emp: any | null;
  }>({ isOpen: false, emp: null });

  const [warningForm, setWarningForm] = useState({
    level: "TEGURAN_1",
    category: "KEHADIRAN",
    description: "",
    fineAmount: 50000,
    issuedDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE UNTUK INPUT MANUAL ABSENSI BATCH ---
  const [manualForm, setManualForm] = useState({
    date: "",
    shiftId: "",
    timeIn: "",
    timeOut: "",
    deviceName: "Input Manual (WFH/Tugas Luar)",
  });
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // --- STATE UNTUK MODAL PEMILIH PEGAWAI ---
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [empSearchTerm, setEmpSearchTerm] = useState("");
  const [empDivisiFilter, setEmpDivisiFilter] = useState("all");
  const [empCurrentPage, setEmpCurrentPage] = useState(1);
  const empItemsPerPage = 10;

  // State sementara di dalam modal sebelum dikonfirmasi
  const [tempSelectedEmployees, setTempSelectedEmployees] = useState<any[]>([]);

  // ✨ Handle perubahan Shift (Fix TypeScript Build Error)
  const handleShiftChange = (shiftId: string | null) => {
    // Memberikan fallback jika shiftId bernilai null
    const safeShiftId = shiftId ?? "";

    const selectedShift = MOCK_SHIFTS.find((s) => s.id === safeShiftId);
    if (selectedShift) {
      setManualForm({
        ...manualForm,
        shiftId: safeShiftId,
        timeIn: selectedShift.startTime,
        timeOut: selectedShift.endTime,
      });
    } else {
      setManualForm({
        ...manualForm,
        shiftId: safeShiftId,
        timeIn: "",
        timeOut: "",
      });
    }
  };

  // --- HANDLERS UNTUK MODAL PEGAWAI ---
  const openEmployeeModal = async () => {
    setTempSelectedEmployees([...selectedEmployees]);
    setIsEmployeeModalOpen(true);

    if (allEmployees.length === 0) {
      setIsFetchingEmployees(true);
      try {
        const resEmployees = await getEmployeesForAssign();
        if (resEmployees?.success) {
          setAllEmployees(resEmployees.data || []);
        } else {
          console.error("Gagal memuat pegawai:", resEmployees?.error);
        }
      } catch (error) {
        console.error("Fetch pegawai crash:", error);
      } finally {
        setIsFetchingEmployees(false);
      }
    }
  };

  const toggleEmployeeSelection = (emp: any) => {
    setTempSelectedEmployees((prev) => {
      const exists = prev.find((p) => p.id === emp.id);
      if (exists) return prev.filter((p) => p.id !== emp.id);
      return [...prev, emp];
    });
  };

  const toggleAllEmployees = (checked: boolean, pageEmployees: any[]) => {
    if (checked) {
      setTempSelectedEmployees((prev) => {
        const newArr = [...prev];
        pageEmployees.forEach((emp) => {
          if (!newArr.find((p) => p.id === emp.id)) newArr.push(emp);
        });
        return newArr;
      });
    } else {
      setTempSelectedEmployees((prev) =>
        prev.filter((p) => !pageEmployees.find((pe) => pe.id === p.id)),
      );
    }
  };

  const confirmEmployeeSelection = () => {
    setSelectedEmployees([...tempSelectedEmployees]);
    setIsEmployeeModalOpen(false);
  };

  const filteredEmployeesForModal = useMemo(() => {
    const term = empSearchTerm.toLowerCase();
    return allEmployees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(term) ||
        (emp.niy || "").toLowerCase().includes(term);
      const matchDivisi =
        empDivisiFilter === "all" ||
        String(emp.divisi?.id) === String(empDivisiFilter) ||
        String(emp.divisiId) === String(empDivisiFilter);
      return matchSearch && matchDivisi;
    });
  }, [allEmployees, empSearchTerm, empDivisiFilter]);

  const totalEmpPages =
    Math.ceil(filteredEmployeesForModal.length / empItemsPerPage) || 1;
  const paginatedEmployeesForModal = useMemo(() => {
    const start = (empCurrentPage - 1) * empItemsPerPage;
    return filteredEmployeesForModal.slice(start, start + empItemsPerPage);
  }, [filteredEmployeesForModal, empCurrentPage]);

  // --- HANDLERS UNTUK LAPORAN (EXISTING) ---
  const openWarningModal = (emp: any) => {
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
      fineAmount: 50000,
      issuedDate: new Date().toISOString().split("T")[0],
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
          userId: warningModal.emp?.id,
          level: warningForm.level,
          category: warningForm.category,
          description: warningForm.description,
          fineAmount: Number(warningForm.fineAmount),
          issuedDate: warningForm.issuedDate,
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
        dataToExport as any,
        state.startDate,
        state.endDate,
      );
    } catch (error) {
      console.error("Export gagal:", error);
      alert("Terjadi kesalahan saat mengexport Excel.");
    }
  };

  // --- HANDLER UNTUK SUBMIT MANUAL ABSENSI BATCH ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualForm.date) return alert("Tanggal absensi wajib diisi!");
    if (selectedEmployees.length === 0)
      return alert("Pilih minimal satu pegawai!");
    if (!manualForm.timeIn && !manualForm.timeOut) {
      return alert("Minimal isi salah satu: Jam Masuk atau Jam Pulang!");
    }

    setIsSubmittingManual(true);
    try {
      const payload = {
        date: manualForm.date,
        timeIn: manualForm.timeIn || undefined,
        timeOut: manualForm.timeOut || undefined,
        deviceName: manualForm.deviceName,
        employeeIds: selectedEmployees.map((emp) => emp.id),
      };

      const res = await fetch(`${API_BASE_URL}/attendance/manual-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(
          `Berhasil menyimpan data absensi untuk ${selectedEmployees.length} pegawai!`,
        );
        // Reset form
        setManualForm({
          ...manualForm,
          shiftId: "",
          timeIn: "",
          timeOut: "",
        });
        setSelectedEmployees([]);
      } else {
        alert(
          "Gagal menyimpan absensi: " +
            (data.error || data.message || "Kesalahan Server"),
        );
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20 text-gray-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Kelola Kehadiran
          </h1>
          <p className="text-gray-400 mt-1">
            Rekapitulasi dan penyesuaian data absensi pegawai.
          </p>
        </div>

        {/* Navigasi Tab */}
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "report"
                ? "bg-gray-900 text-white shadow-sm border border-gray-700"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <Calendar className="w-4 h-4" /> Laporan Absensi
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "manual"
                ? "bg-gray-900 text-white shadow-sm border border-gray-700"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Input Manual (Batch)
          </button>
        </div>
      </header>

      {/* =========================================================================
          TAB 1: LAPORAN ABSENSI (UI LAMA)
          ========================================================================= */}
      {activeTab === "report" && (
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 items-end">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
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
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportExcel}
                    disabled={
                      state.filteredReportData.length === 0 || state.isLoading
                    }
                    className="h-10 bg-emerald-600/20 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-600/30"
                  >
                    <Download className="w-4 h-4 md:mr-2" />{" "}
                    <span className="hidden md:inline">Export</span>
                  </Button>
                  <Button
                    onClick={actions.handleGenerateReport}
                    disabled={state.isLoading}
                    className="w-full md:w-auto h-10 bg-crimson-700 hover:bg-crimson-800 text-white"
                  >
                    {state.isLoading ? (
                      "Memproses..."
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" /> Tampilkan
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: INPUT ABSENSI MANUAL (MODEL ASSIGN BATCH WFH)
          ========================================================================= */}
      {activeTab === "manual" && (
        <Card className="bg-gray-900 border-gray-800 shadow-md">
          <CardHeader className="border-b border-gray-800 pb-4">
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-500" /> Penugasan
              Absensi Efisien (WFH/Luar Kota)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Pilih tanggal, gunakan referensi shift agar jam terisi otomatis,
              lalu pilih banyak pegawai sekaligus.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleManualSubmit} className="space-y-8">
              {/* Bagian 1: Waktu & Shift */}
              <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-crimson-400" /> 1. Atur Waktu &
                  Template Shift
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Tanggal Absensi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      value={manualForm.date}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, date: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700 text-gray-100 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Pilih Template Shift (Otomatisasi Jam)
                    </Label>
                    <Select
                      value={manualForm.shiftId}
                      onValueChange={handleShiftChange}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 focus:border-emerald-500">
                        <SelectValue placeholder="-- Pilih Shift (Opsional) --" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="none">-- Isi Manual --</SelectItem>
                        {MOCK_SHIFTS.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.name} ({shift.startTime} - {shift.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Jam Masuk (Check-In)
                    </Label>
                    <Input
                      type="time"
                      value={manualForm.timeIn}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, timeIn: e.target.value })
                      }
                      className="bg-gray-900 border-gray-700 text-amber-400 font-medium focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Jam Pulang (Check-Out)
                    </Label>
                    <Input
                      type="time"
                      value={manualForm.timeOut}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          timeOut: e.target.value,
                        })
                      }
                      className="bg-gray-900 border-gray-700 text-amber-400 font-medium focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Pegawai */}
              <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700 pb-2">
                  <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" /> 2. Tentukan
                    Pegawai Terkait
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openEmployeeModal}
                    className="border-emerald-700 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/40 text-xs h-8"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Pilih Pegawai
                  </Button>
                </div>

                {selectedEmployees.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border border-dashed border-gray-700 rounded bg-gray-900/30">
                    Belum ada pegawai yang dipilih. Klik tombol di atas untuk
                    memilih.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">
                      Total {selectedEmployees.length} pegawai terpilih:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-xs text-gray-200 flex items-center gap-2"
                        >
                          {emp.name}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedEmployees((prev) =>
                                prev.filter((p) => p.id !== emp.id),
                              )
                            }
                            className="text-gray-500 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bagian 3: Keterangan */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Keterangan / Status Presensi
                </Label>
                <Input
                  type="text"
                  placeholder="Contoh: WFH, Tugas Dinas Luar, Lupa Absen..."
                  value={manualForm.deviceName}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, deviceName: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-gray-100 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end border-t border-gray-800">
                <Button
                  type="submit"
                  disabled={
                    isSubmittingManual || selectedEmployees.length === 0
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                >
                  {isSubmittingManual ? (
                    <>Memproses...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Simpan{" "}
                      {selectedEmployees.length} Absensi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* =========================================================================
          MODAL PILIH PEGAWAI BATCH ASSIGN
          ========================================================================= */}
      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
        <DialogContent className="!w-[60vw] !max-w-[95vw] max-h-[85vh] flex flex-col bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">Pilih Pegawai</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tandai pegawai yang akan dibuatkan absensi manualnya secara
              serentak.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari Nama atau NIY..."
                className="pl-9 bg-gray-800 border-gray-700 text-gray-100 focus:border-emerald-500"
                value={empSearchTerm}
                onChange={(e) => setEmpSearchTerm(e.target.value)}
              />
            </div>
            {/* Filter Divisi */}
            <Select
              value={empDivisiFilter}
              onValueChange={(v) => setEmpDivisiFilter(v ?? "all")}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-gray-800 border-gray-700 text-gray-200">
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectItem value="all">Semua Divisi</SelectItem>
                {state.divisions.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col mt-4 border border-gray-800 rounded-md">
            <div className="overflow-y-auto flex-1">
              <Table>
                <TableHeader className="bg-gray-800/50 sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={
                          paginatedEmployeesForModal.length > 0 &&
                          paginatedEmployeesForModal.every((emp) =>
                            tempSelectedEmployees.find((p) => p.id === emp.id),
                          )
                        }
                        onCheckedChange={(c) =>
                          toggleAllEmployees(!!c, paginatedEmployeesForModal)
                        }
                      />
                    </TableHead>
                    <TableHead className="text-gray-300">
                      Nama Pegawai
                    </TableHead>
                    <TableHead className="text-gray-300">NIY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetchingEmployees ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-10 text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="w-6 h-6 animate-spin text-emerald-500" />
                          Memuat data pegawai dari server...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedEmployeesForModal.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-gray-500"
                      >
                        Tidak ada pegawai yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEmployeesForModal.map((emp) => (
                      <TableRow
                        key={emp.id}
                        className="cursor-pointer hover:bg-gray-800/50 transition-colors border-gray-800"
                        onClick={() => toggleEmployeeSelection(emp)}
                      >
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={
                              !!tempSelectedEmployees.find(
                                (p) => p.id === emp.id,
                              )
                            }
                            onCheckedChange={() => toggleEmployeeSelection(emp)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {emp.name}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {emp.niy || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalEmpPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-800">
                <span className="text-sm text-gray-400">
                  Menampilkan {paginatedEmployeesForModal.length} dari{" "}
                  {filteredEmployeesForModal.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmpCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={empCurrentPage === 1}
                    className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEmpCurrentPage((p) => Math.min(totalEmpPages, p + 1))
                    }
                    disabled={empCurrentPage === totalEmpPages}
                    className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-gray-800 pt-4 mt-2">
            <span className="text-sm font-medium mr-auto text-emerald-400 mt-2">
              Terpilih: {tempSelectedEmployees.length} Orang
            </span>
            <Button
              variant="outline"
              onClick={() => setIsEmployeeModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={confirmEmployeeSelection}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Konfirmasi Pilihan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL SURAT PERINGATAN (SHARED)
          ========================================================================= */}
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
                      setWarningForm({
                        ...warningForm,
                        level: v ?? "TEGURAN_1",
                      })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="TEGURAN_1">ST 1</SelectItem>
                      <SelectItem value="TEGURAN_2">ST 2</SelectItem>
                      <SelectItem value="TEGURAN_3">ST 3</SelectItem>
                      <SelectItem value="SP_1"> </SelectItem>
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
                      const safeCategory = v ?? "KEHADIRAN";
                      const newDesc =
                        safeCategory === "KEHADIRAN"
                          ? warningForm.description
                          : "";
                      setWarningForm({
                        ...warningForm,
                        category: safeCategory,
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Tanggal Surat</Label>
                  <Input
                    type="date"
                    className="bg-gray-800 border-gray-700 text-white focus:border-amber-500"
                    value={warningForm.issuedDate}
                    onChange={(e) =>
                      setWarningForm({
                        ...warningForm,
                        issuedDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Nominal Denda (Rp)</Label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-gray-800 border-gray-700 text-white focus:border-amber-500"
                    value={warningForm.fineAmount}
                    onChange={(e) =>
                      setWarningForm({
                        ...warningForm,
                        fineAmount: Number(e.target.value),
                      })
                    }
                  />
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
