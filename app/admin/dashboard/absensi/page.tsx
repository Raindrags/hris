"use client";

import { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Download,
  Search,
  User,
  Briefcase,
  Hash,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ============================================================================
// API FETCHERS (Pengganti absensi-action)
// ============================================================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getAttendanceReportData = async (
  startDate: string,
  endDate: string,
  divisiId: string, // <-- Variabel ini sekarang akan menerima NAMA DIVISI
) => {
  try {
    const params = new URLSearchParams({ startDate, endDate });
    if (divisiId && divisiId !== "all") {
      // Mengirim param 'divisiId' yang sebenarnya berisi 'divisi name' ke API
      params.append("divisiId", divisiId);
    }

    const response = await fetch(
      `${API_BASE_URL}/attendance/report?${params.toString()}`,
    );
    return await response.json();
  } catch (error) {
    console.error("Fetch report error:", error);
    return { success: false, error: "Gagal memuat data dari server." };
  }
};

const getDivisions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/divisions`);
    return await response.json();
  } catch (error) {
    console.error("Fetch divisions error:", error);
    return { success: false, data: [] };
  }
};

// ============================================================================
// INTERFACES
// ============================================================================
interface AttendanceLog {
  date: string;
  dayName: string;
  isSpecialWorkDay: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  in: string | null;
  out: string | null;
  lateDuration: string;
  earlyLeaveDuration: string;
  isAbsent: boolean;
  status: string;
  // UPDATE API BARU: tambahan opsional
  leaveType?: string | null;
  leaveCategory?: string | null;
  partialLeave?: {
    type: string;
    timeRange: string;
  } | null;
}

interface EmployeeReport {
  id: string;
  name: string;
  niy: string | null;
  jabatan: string | null;
  isGuruRole: boolean;
  shiftName: string;
  checkIn: string;
  checkOut: string;
  summary: {
    onTime: number;
    late: number;
    off: number;
    noFp: number; // deprecated, tetap ada untuk kompatibilitas
    overtime: number;
    hasViolation: boolean;
    // UPDATE API BARU: tambahan opsional
    alpa?: number;
    cuti?: number;
    izin?: number;
  };
  logs: AttendanceLog[];
}

interface Division {
  id: string;
  name: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function RekapAbsensiView() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [divisiId, setDivisiId] = useState<string>("all");

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [reportData, setReportData] = useState<EmployeeReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // STATE PENCARIAN & DEBOUNCE
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // STATE PAGINASI
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchDivisions = async () => {
      const res = await getDivisions();
      if (res.success && res.data) setDivisions(res.data);
    };

    fetchDivisions();

    const today = format(new Date(), "yyyy-MM-dd");
    setStartDate(today);
    setEndDate(today);
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Pilih tanggal mulai dan tanggal akhir terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);

    try {
      const res = await getAttendanceReportData(
        startDate,
        endDate,
        divisiId === "all" ? "" : divisiId,
      );

      if (res.success && res.data) {
        // PERBAIKAN VERCEL: Menggunakan interface EmployeeReport dan AttendanceLog, bukan type 'any'
        const processedData = res.data.map((emp: EmployeeReport) => {
          const filteredLogs = emp.logs.filter((log: AttendanceLog) => {
            // Sembunyikan hari Minggu/Sabtu hanya jika tidak ada absen dan bukan hari dinas khusus
            if (log.dayName === "Sunday" && !log.in && !log.isSpecialWorkDay)
              return false;
            if (
              emp.isGuruRole &&
              log.dayName === "Saturday" &&
              !log.in &&
              !log.isSpecialWorkDay
            ) {
              return false;
            }
            return true;
          });

          return { ...emp, logs: filteredLogs };
        });

        setReportData(processedData);
      } else {
        alert(res.error || "Gagal mengambil data laporan.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReportData = useMemo(() => {
    if (!debouncedSearch) return reportData;
    const lowerQuery = debouncedSearch.toLowerCase();
    return reportData.filter((emp) => {
      const matchName = emp.name.toLowerCase().includes(lowerQuery);
      const matchNiy = emp.niy
        ? emp.niy.toLowerCase().includes(lowerQuery)
        : false;
      return matchName || matchNiy;
    });
  }, [reportData, debouncedSearch]);

  const totalPages = Math.ceil(filteredReportData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReportData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReportData, currentPage, itemsPerPage]);

  const handleExportExcel = async () => {
    const dataToExport =
      filteredReportData.length > 0 ? filteredReportData : reportData;

    if (dataToExport.length === 0) {
      alert(
        "Tidak ada data untuk diekspor. Silakan generate laporan terlebih dahulu.",
      );
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Absensi", {
      pageSetup: {
        paperSize: 9,
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    });

    worksheet.columns = [
      { width: 4 },
      { width: 11 },
      { width: 7 },
      { width: 7 },
      { width: 7 },
      { width: 7 },
      { width: 2 },
      { width: 4 },
      { width: 11 },
      { width: 7 },
      { width: 7 },
      { width: 7 },
      { width: 7 },
    ];

    let currentRow = 1;

    const applyBorder = (cell: ExcelJS.Cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    };

    const translateDay = (dayName: string) => {
      const days: Record<string, string> = {
        Sunday: "MINGGU",
        Monday: "SENIN",
        Tuesday: "SELASA",
        Wednesday: "RABU",
        Thursday: "KAMIS",
        Friday: "JUMAT",
        Saturday: "SABTU",
      };
      return days[dayName] || dayName.toUpperCase();
    };

    const formatTime = (time: string) => (time ? time.substring(0, 5) : "");

    for (let i = 0; i < dataToExport.length; i += 2) {
      const emp1 = dataToExport[i];
      const emp2 = dataToExport[i + 1];

      // HEADER ORANG 1
      const shiftText1 = `${emp1.isGuruRole ? "GURU" : "STAFF"} 22 HARI KERJA : ${formatTime(emp1.checkIn)}-${formatTime(emp1.checkOut)} / ${emp1.isGuruRole ? "PARENTING 08:00-11:30" : `SABTU ${formatTime(emp1.checkIn)}-${formatTime(emp1.checkOut)}`}`;
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const shiftCell1 = worksheet.getCell(`A${currentRow}`);
      shiftCell1.value = shiftText1;
      shiftCell1.font = { bold: true, size: 8, name: "Arial" };
      shiftCell1.alignment = { horizontal: "center", vertical: "middle" };

      // HEADER ORANG 2
      if (emp2) {
        const shiftText2 = `${emp2.isGuruRole ? "GURU" : "STAFF"} 22 HARI KERJA : ${formatTime(emp2.checkIn)}-${formatTime(emp2.checkOut)} / ${emp2.isGuruRole ? "PARENTING 08:00-11:30" : `SABTU ${formatTime(emp2.checkIn)}-${formatTime(emp2.checkOut)}`}`;
        worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
        const shiftCell2 = worksheet.getCell(`H${currentRow}`);
        shiftCell2.value = shiftText2;
        shiftCell2.font = { bold: true, size: 8, name: "Arial" };
        shiftCell2.alignment = { horizontal: "center", vertical: "middle" };
      }
      currentRow++;

      // NAMA
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value =
        `${emp1.name.toUpperCase()}/${emp1.niy || "-"}/${emp1.jabatan?.toUpperCase() || "-"}`;
      worksheet.getCell(`A${currentRow}`).font = {
        bold: true,
        size: 8,
        name: "Arial",
      };

      if (emp2) {
        worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
        worksheet.getCell(`H${currentRow}`).value =
          `${emp2.name.toUpperCase()}/${emp2.niy || "-"}/${emp2.jabatan?.toUpperCase() || "-"}`;
        worksheet.getCell(`H${currentRow}`).font = {
          bold: true,
          size: 8,
          name: "Arial",
        };
      }
      currentRow++;

      // TABLE HEADERS
      const headers = [
        "DAYS",
        "DATE",
        "IN",
        "OUT",
        "LATE",
        "EARLY",
        "",
        "DAYS",
        "DATE",
        "IN",
        "OUT",
        "LATE",
        "EARLY",
      ];
      const headerRow = worksheet.getRow(currentRow);
      headerRow.values = headers;
      for (let col = 1; col <= 13; col++) {
        if (col !== 7) {
          const cell = headerRow.getCell(col);
          cell.font = { bold: true, size: 8, name: "Arial" };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          applyBorder(cell);
        }
      }
      currentRow++;

      const dates1 = emp1.logs.map((l) => l.date);
      const dates2 = emp2 ? emp2.logs.map((l) => l.date) : [];
      const uniqueDates = Array.from(new Set([...dates1, ...dates2])).sort();

      for (let d = 0; d < uniqueDates.length; d++) {
        const currentDate = uniqueDates[d];
        const log1 = emp1.logs.find((l) => l.date === currentDate);
        const log2 = emp2
          ? emp2.logs.find((l) => l.date === currentDate)
          : null;
        const row = worksheet.getRow(currentRow);
        row.height = 12.5;

        // ============================================
        // RENDER ORANG 1
        // ============================================
        if (log1) {
          row.getCell(1).value = d + 1;
          row.getCell(2).value = log1.date;

          if (log1.isHoliday && !log1.in && !log1.isSpecialWorkDay) {
            row.getCell(3).value = `LIBUR: ${log1.holidayName?.toUpperCase()}`;
            worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
            row.getCell(3).font = {
              bold: true,
              color: { argb: "FFFF0000" },
              size: 8,
              name: "Arial",
            }; // Merah
          } else if (!log1.in && log1.status === "DAY OFF") {
            row.getCell(3).value = translateDay(log1.dayName);
            worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
          } else if (!log1.in && log1.isSpecialWorkDay) {
            row.getCell(3).value = "DINAS";
            worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
          } else {
            row.getCell(3).value = log1.in ? log1.in.substring(0, 5) : "-";
            row.getCell(4).value = log1.out ? log1.out.substring(0, 5) : "-";
            row.getCell(5).value =
              log1.lateDuration !== "-" ? log1.lateDuration : "-";
            row.getCell(6).value =
              log1.earlyLeaveDuration !== "-" ? log1.earlyLeaveDuration : "-";
          }
        } else {
          for (let col = 1; col <= 6; col++) row.getCell(col).value = "-";
        }
        for (let c = 1; c <= 6; c++) {
          const cell = row.getCell(c);
          if (!cell.font) cell.font = { size: 8, name: "Arial" };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          applyBorder(cell);
        }

        // ============================================
        // RENDER ORANG 2
        // ============================================
        if (emp2) {
          if (log2) {
            row.getCell(8).value = d + 1;
            row.getCell(9).value = log2.date;

            if (log2.isHoliday && !log2.in && !log2.isSpecialWorkDay) {
              row.getCell(10).value =
                `LIBUR: ${log2.holidayName?.toUpperCase()}`;
              worksheet.mergeCells(`J${currentRow}:M${currentRow}`);
              row.getCell(10).font = {
                bold: true,
                color: { argb: "FFFF0000" },
                size: 8,
                name: "Arial",
              }; // Merah
            } else if (!log2.in && log2.status === "DAY OFF") {
              row.getCell(10).value = translateDay(log2.dayName);
              worksheet.mergeCells(`J${currentRow}:M${currentRow}`);
            } else if (!log2.in && log2.isSpecialWorkDay) {
              row.getCell(10).value = "DINAS";
              worksheet.mergeCells(`J${currentRow}:M${currentRow}`);
            } else {
              row.getCell(10).value = log2.in ? log2.in.substring(0, 5) : "-";
              row.getCell(11).value = log2.out ? log2.out.substring(0, 5) : "-";
              row.getCell(12).value =
                log2.lateDuration !== "-" ? log2.lateDuration : "-";
              row.getCell(13).value =
                log2.earlyLeaveDuration !== "-" ? log2.earlyLeaveDuration : "-";
            }
          } else {
            for (let col = 8; col <= 13; col++) row.getCell(col).value = "-";
          }
          for (let c = 8; c <= 13; c++) {
            const cell = row.getCell(c);
            if (!cell.font) cell.font = { size: 8, name: "Arial" };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            applyBorder(cell);
          }
        }
        currentRow++;
      }
      currentRow += 2;
      if ((i / 2 + 1) % 2 === 0 && i + 2 < dataToExport.length)
        worksheet.getRow(currentRow - 1).addPageBreak();
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Rekap_Absensi_${startDate}_sd_${endDate}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Absensi</h1>
          <p className="text-muted-foreground mt-1">
            Rekapitulasi kehadiran, keterlambatan, dan jam kerja pegawai.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={filteredReportData.length === 0 || isLoading}
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
        >
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* PERBAIKAN UI/UX: Menggunakan flex flex-col gap-2 pada setiap kolom agar jarak konsisten */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="divisi">Divisi / Unit</Label>
              <Select value={divisiId} onValueChange={setDivisiId}>
                <SelectTrigger id="divisi">
                  <SelectValue placeholder="Pilih Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={String(div.id)}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dibungkus flex-col agar posisi button ikut sejajar ke bawah bersama input */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="w-full h-10"
              >
                {isLoading ? (
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

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p>Sedang menarik data absensi dari server...</p>
        </div>
      ) : reportData.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Calendar className="w-12 h-12 mb-4 text-gray-300" />
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
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Menampilkan {filteredReportData.length} pegawai
            </div>
          </div>

          <div className="space-y-8">
            {paginatedData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-gray-50/50">
                <p>
                  Tidak ada pegawai yang cocok dengan pencarian &quot;
                  {searchQuery}&quot;.
                </p>
              </div>
            ) : (
              paginatedData.map((emp) => (
                <Card key={emp.id} className="overflow-hidden shadow-sm">
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <User className="w-5 h-5 text-primary" />
                          {emp.name}
                          {emp.summary.hasViolation && (
                            <span className="ml-2 inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Pelanggaran SP
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5" /> NIY:{" "}
                            {emp.niy || "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />{" "}
                            {emp.jabatan || "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Shift:{" "}
                            {emp.shiftName}
                          </span>
                        </div>
                      </div>
                      {/* ===== PERUBAHAN UTAMA: BADGE DIPISAH MENJADI 4 ===== */}
                      <div className="flex gap-2 text-xs md:text-sm">
                        <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md border border-green-100 flex flex-col justify-center items-center min-w-[70px]">
                          <span className="font-bold text-lg">
                            {emp.summary.onTime}
                          </span>
                          <span>Tepat</span>
                        </div>
                        <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-md border border-orange-100 flex flex-col justify-center items-center min-w-[70px]">
                          <span className="font-bold text-lg">
                            {emp.summary.late}
                          </span>
                          <span>Telat</span>
                        </div>
                        <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-md border border-red-100 flex flex-col justify-center items-center min-w-[70px]">
                          <span className="font-bold text-lg">
                            {emp.summary.alpa ?? emp.summary.noFp ?? 0}
                          </span>
                          <span>Alpa</span>
                        </div>
                        <div className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 flex flex-col justify-center items-center min-w-[70px]">
                          <span className="font-bold text-lg">
                            {emp.summary.off ?? 0}
                          </span>
                          <span>Off</span>
                        </div>
                      </div>
                      {/* ===== AKHIR PERUBAHAN ===== */}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow>
                          <TableHead className="w-[120px] pl-6">
                            Tanggal
                          </TableHead>
                          <TableHead>Hari</TableHead>
                          <TableHead className="text-center">
                            Jam Masuk
                          </TableHead>
                          <TableHead className="text-center">
                            Jam Pulang
                          </TableHead>
                          <TableHead className="text-center text-red-600 font-semibold">
                            Telat
                          </TableHead>
                          <TableHead className="text-center text-orange-600 font-semibold">
                            Awal Pulang
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emp.logs.map((log: AttendanceLog) => (
                          <TableRow
                            key={log.date}
                            className={`
                              ${log.isSpecialWorkDay ? "bg-amber-50/30" : ""} 
                              ${log.isAbsent ? "bg-red-50/20" : ""}
                              ${log.isHoliday ? "bg-red-50/50" : ""}
                            `}
                          >
                            <TableCell className="font-medium pl-6">
                              {log.date}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {log.dayName}
                              {log.isSpecialWorkDay && (
                                <span className="text-amber-600 text-[10px] ml-1.5 px-1.5 py-0.5 bg-amber-100 rounded font-medium">
                                  Wajib
                                </span>
                              )}
                              {log.isHoliday && (
                                <span className="text-red-700 text-[10px] ml-1.5 px-1.5 py-0.5 bg-red-100 rounded font-medium">
                                  Tanggal Merah
                                </span>
                              )}
                              {log.isAbsent && (
                                <span className="text-red-500 text-[10px] ml-1.5 px-1.5 py-0.5 bg-red-100 rounded font-medium inline-flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 inline" /> No
                                  FP
                                </span>
                              )}
                              {/* UPDATE API BARU: tampilkan badge cuti/izin jika ada */}
                              {log.leaveType && (
                                <span className="text-blue-700 text-[10px] ml-1.5 px-1.5 py-0.5 bg-blue-100 rounded font-medium">
                                  {log.leaveType}
                                </span>
                              )}
                              {log.partialLeave && (
                                <span className="text-purple-700 text-[10px] ml-1.5 px-1.5 py-0.5 bg-purple-100 rounded font-medium">
                                  {log.partialLeave.type} (
                                  {log.partialLeave.timeRange})
                                </span>
                              )}
                            </TableCell>

                            {log.isHoliday &&
                            !log.in &&
                            !log.isSpecialWorkDay ? (
                              <TableCell
                                colSpan={4}
                                className="text-center font-bold text-red-600"
                              >
                                LIBUR: {log.holidayName}
                              </TableCell>
                            ) : (
                              <>
                                <TableCell className="text-center">
                                  {log.in ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-gray-400" />{" "}
                                      {log.in.substring(0, 5)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {log.out ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-gray-400" />{" "}
                                      {log.out.substring(0, 5)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                  {log.lateDuration &&
                                  log.lateDuration !== "-" ? (
                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                                      {log.lateDuration}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                  {log.earlyLeaveDuration &&
                                  log.earlyLeaveDuration !== "-" ? (
                                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
                                      {log.earlyLeaveDuration}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-8">
              <p className="text-sm text-muted-foreground">
                Menampilkan halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
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
