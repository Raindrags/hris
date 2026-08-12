"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CalendarX,
  Search,
  Filter,
  Building2,
  CalendarDays,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFilteredReportData } from "@/app/actions/laporan-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface AdminLaporanViewProps {
  divisions: any[];
  periods: any[];
}

export default function AdminLaporanView({
  divisions,
  periods,
}: AdminLaporanViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedDivisi, setSelectedDivisi] = useState<string>("ALL");
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const activePeriod = periods.find((p) => p.isActive);
    if (activePeriod) {
      setSelectedPeriod(activePeriod.id);
    } else if (periods.length > 0) {
      setSelectedPeriod(periods[0].id);
    }
  }, [periods]);

  const handleFetchData = async () => {
    if (!selectedPeriod) return alert("Pilih periode terlebih dahulu!");

    setIsLoading(true);
    const periodObj = periods.find((p) => p.id === selectedPeriod);

    const startDate = new Date(periodObj.startDate).toISOString().split("T")[0];
    const endDate = new Date(periodObj.endDate).toISOString().split("T")[0];

    const res = await getFilteredReportData(startDate, endDate, selectedDivisi);

    if (res.success) {
      const rawPayload = res.data;
      const parsedList = Array.isArray(rawPayload)
        ? rawPayload
        : rawPayload?.data || rawPayload?.dataList || [];

      setReportData(parsedList);
    } else {
      alert("Gagal mengambil data: " + res.error);
      setReportData(null);
    }
    setIsLoading(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const validReportData = useMemo(() => {
    if (!reportData) return [];
    return reportData.filter(
      (person) => person.catatan && person.catatan.length > 0,
    );
  }, [reportData]);

  const summaryStats = useMemo(() => {
    let totalTerlambat = 0;
    let totalCutiIzin = 0;
    let totalCatatan = 0;

    validReportData.forEach((person) => {
      person.catatan.forEach((rekam: any) => {
        totalCatatan++;
        // Gabungkan semua kemungkinan tempat status berada untuk pengecekan
        const teksPengecekan =
          `${rekam.alasan || ""} ${rekam.status || ""} ${rekam.keterangan || ""}`.toUpperCase();

        if (
          teksPengecekan.includes("TERLAMBAT") ||
          teksPengecekan.includes("PULANG AWAL")
        ) {
          totalTerlambat++;
        }
        if (
          teksPengecekan.includes("CUTI") ||
          teksPengecekan.includes("IZIN") ||
          teksPengecekan.includes("SAKIT") ||
          teksPengecekan.includes("DINAS")
        ) {
          totalCutiIzin++;
        }
      });
    });

    return { totalTerlambat, totalCutiIzin, totalCatatan };
  }, [validReportData]);

  const periodObj = periods.find((p) => p.id === selectedPeriod);
  const selectedPeriodLabel = periodObj
    ? `${new Date(periodObj.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long" })} - ${new Date(periodObj.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`
    : "";

  const selectedDivisiObj = divisions.find((d) => d.id === selectedDivisi);

  return (
    <div className="space-y-6">
      <Card className="print:hidden shadow-sm border-white/10 bg-card">
        <CardHeader className="pb-4 border-b border-white/10">
          <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
            <Filter className="h-5 w-5 text-blue-500" />
            Filter Laporan Absensi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-5 items-end">
            <div className="w-full lg:w-2/5 space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Periode Absensi
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full h-11 bg-white border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 rounded-lg transition-all text-left">
                  <div className="flex items-center gap-2 text-slate-700 w-full overflow-hidden">
                    <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Pilih Periode Absensi">
                      {periodObj
                        ? `${periodObj.name} (${new Date(periodObj.startDate).toLocaleDateString("id-ID")} - ${new Date(periodObj.endDate).toLocaleDateString("id-ID")})`
                        : "Pilih Periode"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="cursor-pointer"
                    >
                      <span className="font-medium">{p.name}</span>{" "}
                      <span className="text-muted-foreground text-xs ml-1">
                        ({new Date(p.startDate).toLocaleDateString("id-ID")} -{" "}
                        {new Date(p.endDate).toLocaleDateString("id-ID")})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-1/3 space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Divisi
              </label>
              <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
                <SelectTrigger className="w-full h-11 bg-white border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 rounded-lg transition-all text-left">
                  <div className="flex items-center gap-2 text-slate-700 w-full overflow-hidden">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Pilih Divisi">
                      {selectedDivisi === "ALL"
                        ? "Semua Divisi"
                        : selectedDivisiObj?.name}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="ALL"
                    className="font-medium cursor-pointer"
                  >
                    Semua Divisi
                  </SelectItem>
                  {divisions.map((d) => (
                    <SelectItem
                      key={d.id}
                      value={d.id}
                      className="cursor-pointer"
                    >
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 w-full lg:w-auto lg:ml-auto">
              <Button
                onClick={handleFetchData}
                disabled={isLoading}
                className="w-full lg:w-auto h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Memuat..." : "Tampilkan"}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={!reportData}
                className="w-full lg:w-auto h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!reportData ? (
        <Card className="border-dashed shadow-none bg-slate-50 print:hidden">
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-slate-400">
            <FileText className="h-12 w-12 mb-3 opacity-20" />
            <p>
              Silakan atur filter di atas dan klik <strong>Tampilkan</strong>{" "}
              untuk memuat data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 bg-white p-1 print:p-0 rounded-lg">
          <div className="flex flex-col items-center mb-6 w-full">
            {/* Menggunakan flex dan gap-6 agar logo dan teks berdekatan secara natural */}
            <div className="flex items-center justify-center gap-6 w-full mb-3">
              {/* Class absolute dihilangkan, ditambahkan shrink-0 agar logo tidak menyusut */}
              <div className="shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Sekolah"
                  width={110} // Ukuran dibesarkan dari 70 ke 110
                  height={110} // Ukuran dibesarkan dari 70 ke 110
                  className="w-[110px] h-[110px] object-contain"
                />
              </div>

              <div className="text-center">
                <h1 className="text-xl font-extrabold uppercase tracking-widest text-black">
                  SEKOLAH MAITREYAWIRA DELI SERDANG
                </h1>
                <h2 className="text-lg font-bold uppercase text-black mt-1">
                  REKAP ABSENSI GURU DAN PEGAWAI
                </h2>
                <h3 className="text-md font-bold text-black mt-1">
                  {selectedPeriodLabel}
                </h3>
              </div>
            </div>
            <div className="w-full border-b-[3px] border-black mt-2"></div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print:hidden mb-6">
            <Card className="border-blue-100 bg-blue-50/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Catatan
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {summaryStats.totalCatatan}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-100 bg-orange-50/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Total Terlambat/Pulang Awal
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {summaryStats.totalTerlambat}
                  </p>
                </div>
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-100 bg-red-50/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Total Cuti / Izin / Sakit
                  </p>
                  <p className="text-3xl font-bold text-red-700">
                    {summaryStats.totalCutiIzin}
                  </p>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <CalendarX className="h-5 w-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse border border-black print:text-[11px]">
              <thead className="bg-slate-100 print:bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border border-black font-bold text-center w-12 text-black">
                    No
                  </th>
                  <th className="py-2 px-3 border border-black font-bold text-black">
                    Nama
                  </th>
                  <th className="py-2 px-3 border border-black font-bold text-center text-black w-28">
                    Tanggal
                  </th>
                  <th className="py-2 px-3 border border-black font-bold text-center text-black w-32">
                    Status
                  </th>
                  <th className="py-2 px-3 border border-black font-bold text-black">
                    Keterangan
                  </th>
                  <th className="py-2 px-3 border border-black font-bold text-black w-48">
                    Alasan
                  </th>
                </tr>
              </thead>
              <tbody>
                {validReportData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground border border-black"
                    >
                      Tidak ada catatan absensi (Sakit/Izin/Cuti/dll) pada
                      periode/divisi ini.
                    </td>
                  </tr>
                ) : (
                  validReportData.map((person, idx) => {
                    const records = person.catatan;

                    return records.map((item: any, recIdx: number) => {
                      // LOGIKA BARU: Lewati strip (-)
                      let rawStatus = item.status;
                      if (!rawStatus || rawStatus === "-")
                        rawStatus = item.alasan;
                      if (!rawStatus || rawStatus === "-")
                        rawStatus = item.keterangan;
                      if (!rawStatus) rawStatus = "-";

                      const statusUpper = rawStatus.toUpperCase();
                      let statusColor = "text-slate-700";

                      // PAKSA DISPLAY SESUAI PERMINTAAN
                      let displayStatus = rawStatus;

                      if (statusUpper.includes("SAKIT")) {
                        statusColor = "text-red-600 font-semibold";
                        displayStatus = "SAKIT";
                      } else if (statusUpper.includes("IZIN")) {
                        statusColor = "text-orange-500 font-semibold";
                        displayStatus = "IZIN";
                      } else if (statusUpper.includes("CUTI")) {
                        statusColor = "text-purple-600 font-semibold";
                        displayStatus = "CUTI";
                      } else if (statusUpper.includes("DINAS")) {
                        statusColor = "text-blue-600 font-semibold";
                        displayStatus = "DINAS";
                      } else if (
                        statusUpper.includes("TERLAMBAT") ||
                        statusUpper.includes("PULANG AWAL")
                      ) {
                        statusColor = "text-yellow-600 font-semibold";
                      }

                      return (
                        <tr
                          key={`${person.no || idx}-${recIdx}`}
                          className="hover:bg-slate-50 print:hover:bg-transparent"
                        >
                          {recIdx === 0 && (
                            <td
                              className="py-2 px-3 border border-black text-center align-top text-black"
                              rowSpan={records.length}
                            >
                              {idx + 1}
                            </td>
                          )}

                          {recIdx === 0 && (
                            <td
                              className="py-2 px-3 border border-black font-medium align-top text-black"
                              rowSpan={records.length}
                            >
                              {person.nama || "-"}
                            </td>
                          )}

                          <td className="py-2 px-3 border border-black text-center whitespace-nowrap text-black">
                            {item.tanggal || "-"}
                          </td>

                          <td className="py-2 px-3 border border-black text-center print:text-black">
                            <span
                              className={`print:text-black print:font-semibold uppercase ${statusColor}`}
                            >
                              {displayStatus}
                            </span>
                          </td>

                          <td className="py-2 px-3 border border-black text-black">
                            {item.keterangan || "-"}
                          </td>

                          <td className="py-2 px-3 border border-black text-black">
                            {item.alasanDetail || item.alasan || "-"}
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
