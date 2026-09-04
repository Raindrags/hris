"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Filter, Users, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFilteredTeamReportData } from "@/app/actions/team-report-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface LaporanTimViewProps {
  periods: any[];
  subordinates: any[];
  userName?: string; // 💡 Menambahkan properti untuk menerima nama dari database
}

export default function LaporanTimView({
  periods,
  subordinates,
  userName = "", // 💡 Set default string kosong
}: LaporanTimViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedBawahan, setSelectedBawahan] = useState<string>("ALL");
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

    const res = await getFilteredTeamReportData(
      startDate,
      endDate,
      selectedBawahan,
    );

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

    const cleanedData = reportData.map((person) => {
      const rawCatatan = person.catatan || [];

      const filteredCatatan = rawCatatan.filter((rekam: any) => {
        if (!rekam.tanggal) return true;

        const dateObj = new Date(rekam.tanggal);
        const isSunday = dateObj.getDay() === 0;
        const isSaturday = dateObj.getDay() === 6;

        const shiftStr = (
          person.shiftName ||
          person.shiftType ||
          ""
        ).toLowerCase();
        const isMonFriShift =
          shiftStr.includes("jumat") || shiftStr.includes("senin-jumat");
        const isSaturdayOff = isSaturday && isMonFriShift;

        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const mmdd = `${month}-${day}`;

        const KNOWN_HOLIDAYS = ["08-17", "01-01", "12-25"];
        const isKnownHoliday = KNOWN_HOLIDAYS.includes(mmdd);

        const isPublicHoliday = rekam.isHoliday === true || isKnownHoliday;
        const isSpecialWorkDay = rekam.isSpecialWorkDay === true;

        const isOffDay =
          (isSunday || isSaturdayOff || isPublicHoliday) && !isSpecialWorkDay;

        if (isOffDay) {
          const teksPengecekan =
            `${rekam.alasan || ""} ${rekam.status || ""} ${rekam.keterangan || ""}`.toUpperCase();

          if (
            teksPengecekan.includes("TERLAMBAT") ||
            teksPengecekan.includes("PULANG AWAL")
          ) {
            return false;
          }
        }
        return true;
      });

      return {
        ...person,
        catatan: filteredCatatan,
      };
    });

    return cleanedData.sort((a, b) => {
      const orderA = a.sortOrder ?? 999;
      const orderB = b.sortOrder ?? 999;
      return orderA - orderB;
    });
  }, [reportData]);

  const periodObj = periods.find((p) => p.id === selectedPeriod);
  const selectedPeriodLabel = periodObj
    ? `${new Date(periodObj.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long" })} - ${new Date(periodObj.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`
    : "";

  const formatTglBulan = (tglStr: string) => {
    if (!tglStr || tglStr === "-") return "-";
    try {
      const parts = tglStr.split("T")[0].split("-");
      if (parts.length === 3) {
        const dateObj = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
        );
        return dateObj.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
        });
      }
      return tglStr;
    } catch {
      return tglStr;
    }
  };

  const getDetailPemotongan = (item: any) => {
    const stat = (item.rawStatus || "").toUpperCase();
    const ket = (item.keterangan || "").toUpperCase();
    const alasan = (item.alasan || "").toUpperCase();
    const gabungan = `${stat} ${ket} ${alasan}`;

    let listPotongan: string[] = [];

    if (item.potongGaji) listPotongan.push("Potong Gaji");
    if (item.potongTransport) listPotongan.push("Tunj. Transport");
    if (item.potongKonsumsi) listPotongan.push("Tunj. Konsumsi");
    if (item.potongLainnya) listPotongan.push("Tunj. Lainnya");

    if (item.invalNominal > 0) {
      listPotongan.push(
        `Inval: Rp ${item.invalNominal.toLocaleString("id-ID")}`,
      );
    }
    if (item.shiftNominal > 0) {
      listPotongan.push(
        `Ganti Shift: Rp ${item.shiftNominal.toLocaleString("id-ID")}`,
      );
    }
    if (item.dendaTelatNominal > 0) {
      listPotongan.push(
        `Denda Telat: Rp ${item.dendaTelatNominal.toLocaleString("id-ID")}`,
      );
    }

    const hasRequestData =
      item.potongGaji ||
      item.potongTransport ||
      item.potongKonsumsi ||
      item.potongLainnya ||
      item.invalNominal > 0 ||
      item.shiftNominal > 0 ||
      item.dendaTelatNominal > 0;

    if (!hasRequestData) {
      if (
        gabungan.includes("ALFA") ||
        gabungan.includes("TANPA KETERANGAN") ||
        gabungan.includes("MANGKIR")
      ) {
        listPotongan.push("Potong Gaji", "Tunj. Transport", "Tunj. Konsumsi");
      }
    }

    if (listPotongan.length > 0) {
      return (
        <div className="text-red-500 dark:text-red-400 font-medium text-[12px] text-left">
          <ul className="space-y-0.5 print:text-black">
            {listPotongan.map((potongan, idx) => (
              <li key={idx}>• {potongan}</li>
            ))}
          </ul>
        </div>
      );
    }

    return "-";
  };

  const renderAkumulasiDenda = (denda: any) => {
    if (!denda) return null;

    const hasPotongan =
      denda.tunjanganTransport > 0 ||
      denda.tunjanganKonsumsi > 0 ||
      denda.tunjanganLainnya > 0 ||
      denda.potongGaji > 0 ||
      denda.totalDendaRupiah > 0 ||
      (denda.detailTeguran && denda.detailTeguran.length > 0);

    if (!hasPotongan) return null;

    return (
      <div className="mt-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-2 rounded-md print:border-none print:bg-transparent print:p-0 print:mt-1">
        <div className="text-xs font-bold text-red-800 dark:text-red-300 border-b border-red-200 dark:border-red-900/50 pb-1 mb-1 print:text-black print:border-black">
          Akumulasi Potongan:
        </div>
        <ul className="text-[11px] text-red-700 dark:text-red-400 space-y-0.5 print:text-black">
          {denda.tunjanganTransport > 0 && (
            <li>• Tunj. Transport: {denda.tunjanganTransport}x</li>
          )}
          {denda.tunjanganKonsumsi > 0 && (
            <li>• Tunj. Konsumsi: {denda.tunjanganKonsumsi}x</li>
          )}
          {denda.tunjanganLainnya > 0 && (
            <li>• Tunj. Lainnya: {denda.tunjanganLainnya}x</li>
          )}
          {denda.potongGaji > 0 && <li>• Potong Gaji: {denda.potongGaji}x</li>}

          {denda.dendaTelatNominal > 0 && (
            <li>
              • Denda Telat: Rp{" "}
              {denda.dendaTelatNominal.toLocaleString("id-ID")}
            </li>
          )}
          {denda.invalCount > 0 && (
            <li>
              • Inval ({denda.invalCount}x): Rp{" "}
              {denda.invalNominal.toLocaleString("id-ID")}
            </li>
          )}
          {denda.shiftCount > 0 && (
            <li>
              • Ganti Shift ({denda.shiftCount}x): Rp{" "}
              {denda.shiftNominal.toLocaleString("id-ID")}
            </li>
          )}

          {denda.detailTeguran &&
            denda.detailTeguran.length > 0 &&
            denda.detailTeguran.map((teguran: string, idx: number) => (
              <li key={`st-${idx}`}>• {teguran}: Rp 50.000</li>
            ))}
        </ul>
        {denda.totalDendaRupiah > 0 && (
          <div className="text-[11px] font-bold mt-1 pt-1 border-t border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 print:text-black print:border-black">
            Total Denda: Rp {denda.totalDendaRupiah.toLocaleString("id-ID")}
          </div>
        )}
      </div>
    );
  };

  const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <Card className="print:hidden shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold">
            <Filter className="h-5 w-5 text-blue-500" />
            Laporan Tim Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-5 items-end">
            {/* 💡 Mengubah lebar menjadi 1/3 karena 1 kolom telah dihapus */}
            <div className="w-full lg:w-1/3 space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Periode Absensi
              </label>
              <Select
                value={selectedPeriod}
                onValueChange={(val) => setSelectedPeriod(val || "ALL")}
              >
                <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 rounded-lg transition-all text-left">
                  <div className="flex items-center gap-2 w-full overflow-hidden">
                    <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Pilih Periode">
                      {periodObj
                        ? `${periodObj.name} (${new Date(periodObj.startDate).toLocaleDateString("id-ID")} - ${new Date(periodObj.endDate).toLocaleDateString("id-ID")})`
                        : "Pilih Periode"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  {periods.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="cursor-pointer dark:focus:bg-slate-800 dark:text-slate-200"
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

            {/* 💡 Mengubah lebar menjadi 1/3 */}
            <div className="w-full lg:w-1/3 space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pilih Bawahan
              </label>
              <Select
                value={selectedBawahan}
                onValueChange={(val) => setSelectedBawahan(val || "ALL")}
              >
                <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 rounded-lg transition-all text-left">
                  <div className="flex items-center gap-2 w-full overflow-hidden">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Pilih Bawahan">
                      {selectedBawahan === "ALL"
                        ? "Semua Tim Saya"
                        : subordinates.find((s) => s.id === selectedBawahan)
                            ?.name}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem
                    value="ALL"
                    className="font-medium cursor-pointer dark:focus:bg-slate-800 dark:text-slate-200"
                  >
                    Semua Tim Saya
                  </SelectItem>
                  {subordinates.map((sub) => (
                    <SelectItem
                      key={sub.id}
                      value={sub.id}
                      className="cursor-pointer dark:focus:bg-slate-800 dark:text-slate-200"
                    >
                      {sub.name}
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
                className="w-full lg:w-auto h-11 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 shadow-sm rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!reportData ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 shadow-none bg-slate-50 dark:bg-slate-900/50 print:hidden">
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <FileText className="h-12 w-12 mb-3 opacity-20" />
            <p>
              Silakan atur filter di atas dan klik <strong>Tampilkan</strong>{" "}
              untuk memuat data bawahan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 print:p-0 rounded-lg border border-slate-200 dark:border-slate-800 print:border-none print:bg-white text-slate-900 dark:text-slate-100 print:text-black">
          <div className="flex flex-col items-center mb-6 w-full">
            <div className="flex items-center justify-center gap-6 w-full mb-3">
              <div className="shrink-0 bg-white p-2 rounded-lg print:p-0">
                <Image
                  src="/logo.png"
                  alt="Logo Sekolah"
                  width={110}
                  height={110}
                  className="w-[110px] h-[110px] object-contain"
                />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-extrabold uppercase tracking-widest text-slate-900 dark:text-white print:text-black">
                  SEKOLAH MAITREYAWIRA DELI SERDANG
                </h1>
                <h2 className="text-lg font-bold uppercase text-slate-800 dark:text-slate-200 print:text-black mt-1">
                  REKAP ABSENSI GURU DAN PEGAWAI
                </h2>
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-300 print:text-black mt-1">
                  {selectedPeriodLabel}
                </h3>
              </div>
            </div>
            <div className="w-full border-b-[3px] border-slate-900 dark:border-slate-100 print:border-black mt-2"></div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse border border-slate-900 dark:border-slate-700 print:border-black print:text-[11px]">
              <thead className="bg-slate-100 dark:bg-slate-800 print:bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black font-bold text-center w-12 text-slate-900 dark:text-slate-100 print:text-black">
                    No
                  </th>
                  <th className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black font-bold text-slate-900 dark:text-slate-100 print:text-black w-64">
                    Nama
                  </th>
                  <th className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black font-bold text-center text-slate-900 dark:text-slate-100 print:text-black min-w-[140px]">
                    Tanggal
                  </th>
                  <th className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black font-bold text-center text-slate-900 dark:text-slate-100 print:text-black w-32">
                    Status
                  </th>
                  <th className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black font-bold text-slate-900 dark:text-slate-100 print:text-black">
                    Keterangan
                  </th>
                  <th className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black font-bold text-slate-900 dark:text-slate-100 print:text-black w-48">
                    Alasan
                  </th>
                  <th className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black font-bold text-slate-900 dark:text-slate-100 print:text-black w-56">
                    Pemotongan (Harian)
                  </th>
                </tr>
              </thead>
              <tbody>
                {validReportData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground border border-slate-900 dark:border-slate-700 print:border-black"
                    >
                      Tidak ada data absensi untuk pilihan ini.
                    </td>
                  </tr>
                ) : (
                  validReportData.map((person, idx) => {
                    const rawRecords = person.catatan || [];

                    if (rawRecords.length === 0) {
                      return (
                        <tr
                          key={`empty-${person.id || idx}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 print:hover:bg-transparent"
                        >
                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black text-center align-top">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black align-top">
                            <div className="font-bold text-base">
                              {person.nama || person.name || "-"}
                            </div>
                            {renderAkumulasiDenda(person.akumulasiDenda)}
                          </td>
                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black text-center">
                            -
                          </td>
                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black text-center">
                            -
                          </td>
                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black">
                            -
                          </td>
                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black">
                            -
                          </td>
                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black">
                            -
                          </td>
                        </tr>
                      );
                    }

                    const groupedRecords: any[] = [];
                    let currentGroup: any = null;

                    rawRecords.forEach((item: any) => {
                      let rawStatus = item.status;
                      if (!rawStatus || rawStatus === "-")
                        rawStatus = item.alasan;
                      if (!rawStatus || rawStatus === "-")
                        rawStatus = item.keterangan;
                      if (!rawStatus) rawStatus = "-";

                      const statusUpper = rawStatus.toUpperCase();
                      const isCutiIzin =
                        statusUpper.includes("CUTI") ||
                        statusUpper.includes("IZIN") ||
                        statusUpper.includes("SAKIT") ||
                        statusUpper.includes("DINAS");

                      if (!currentGroup) {
                        currentGroup = {
                          ...item,
                          rawStatus,
                          isCutiIzin,
                          endTanggal: item.tanggal,
                        };
                      } else {
                        if (
                          isCutiIzin &&
                          currentGroup.isCutiIzin &&
                          currentGroup.rawStatus === rawStatus &&
                          currentGroup.alasan === item.alasan
                        ) {
                          currentGroup.endTanggal = item.tanggal;
                        } else {
                          groupedRecords.push(currentGroup);
                          currentGroup = {
                            ...item,
                            rawStatus,
                            isCutiIzin,
                            endTanggal: item.tanggal,
                          };
                        }
                      }
                    });

                    if (currentGroup) {
                      groupedRecords.push(currentGroup);
                    }

                    return groupedRecords.map((item: any, recIdx: number) => {
                      const statusUpper = item.rawStatus.toUpperCase();
                      let statusColor = "text-slate-700 dark:text-slate-300";
                      let displayStatus = item.rawStatus;

                      if (statusUpper.includes("SAKIT")) {
                        statusColor =
                          "text-red-600 dark:text-red-400 font-semibold";
                        displayStatus = "SAKIT";
                      } else if (statusUpper.includes("IZIN")) {
                        statusColor =
                          "text-orange-500 dark:text-orange-400 font-semibold";
                        displayStatus = statusUpper.includes("KELUAR")
                          ? "IZIN KELUAR"
                          : "IZIN";
                      } else if (statusUpper.includes("CUTI")) {
                        statusColor =
                          "text-purple-600 dark:text-purple-400 font-semibold";
                        displayStatus = "CUTI";
                      } else if (statusUpper.includes("DINAS")) {
                        statusColor =
                          "text-blue-600 dark:text-blue-400 font-semibold";
                        displayStatus = "DINAS";
                      } else if (
                        statusUpper.includes("TERLAMBAT") ||
                        statusUpper.includes("PULANG AWAL") ||
                        statusUpper.includes("ALFA")
                      ) {
                        statusColor =
                          "text-yellow-600 dark:text-yellow-400 font-semibold";
                      }

                      let displayTanggal = formatTglBulan(item.tanggal);
                      if (item.tanggal !== item.endTanggal) {
                        displayTanggal = `${formatTglBulan(item.tanggal)} - ${formatTglBulan(item.endTanggal)}`;
                      }

                      return (
                        <tr
                          key={`${person.no || idx}-${recIdx}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 print:hover:bg-transparent"
                        >
                          {recIdx === 0 && (
                            <td
                              className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black text-center align-top"
                              rowSpan={groupedRecords.length}
                            >
                              {idx + 1}
                            </td>
                          )}
                          {recIdx === 0 && (
                            <td
                              className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black align-top"
                              rowSpan={groupedRecords.length}
                            >
                              <div className="font-bold text-base">
                                {person.nama || person.name || "-"}
                              </div>
                              {renderAkumulasiDenda(person.akumulasiDenda)}
                            </td>
                          )}

                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black text-center">
                            {displayTanggal}
                          </td>

                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black text-center print:text-black">
                            <span
                              className={`print:text-black print:font-semibold uppercase ${statusColor}`}
                            >
                              {displayStatus}
                            </span>
                          </td>

                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black">
                            {item.keterangan || "-"}

                            {displayStatus === "CUTI" &&
                              (person.sisaCuti !== undefined ||
                                item.sisaCuti !== undefined) && (
                                <div className="mt-1 text-xs font-semibold text-purple-700 dark:text-purple-300 print:text-black">
                                  (Sisa Cuti: {person.sisaCuti ?? item.sisaCuti}{" "}
                                  Hari)
                                </div>
                              )}

                            {displayStatus === "IZIN KELUAR" &&
                              (person.sisaJatahIzinKeluar !== undefined ||
                                item.sisaJatahIzinKeluar !== undefined) && (
                                <div className="mt-1 text-xs font-semibold text-orange-700 dark:text-orange-300 print:text-black">
                                  (Sisa Jatah:{" "}
                                  {item.sisaJatahIzinKeluar ??
                                    person.sisaJatahIzinKeluar}{" "}
                                  Jam)
                                </div>
                              )}
                          </td>

                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black">
                            {item.alasanDetail || item.alasan || "-"}
                          </td>

                          <td className="py-2 px-3 border border-slate-900 dark:border-slate-700 print:border-black text-sm align-top">
                            {getDetailPemotongan(item)}
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex justify-end w-full pr-8 print:mt-16 print:pr-12">
            <div className="text-center w-64">
              <p className="text-sm text-slate-800 dark:text-slate-200 print:text-black mb-24 print:mb-28">
                Medan, {tanggalHariIni}
              </p>
              {/* 💡 Menggunakan properti userName di sini */}
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 print:text-black uppercase underline">
                {userName || "___________________________"}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 print:text-black mt-1">
                Atasan Langsung
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
