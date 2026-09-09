"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Clock,
  CalendarIcon,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PermissionUserData, SubstituteUser } from "./types/permission";
import { usePermissionForm } from "./hooks/usePermissionForm";

interface PermissionFormProps {
  user: PermissionUserData;
  potentialSubstitutes?: SubstituteUser[];
  onSuccess: () => void;
  userId?: string;
  isAdmin?: boolean;
  allowBackdate?: boolean;
  sisaIzinKeluar?: number; // Telah ditambahkan
}

export default function PermissionForm({
  user,
  potentialSubstitutes = [],
  onSuccess,
  userId,
  isAdmin = false,
  allowBackdate = false,
  sisaIzinKeluar, // Diekstrak dari props
}: PermissionFormProps) {
  const { states, actions } = usePermissionForm({
    user,
    potentialSubstitutes,
    onSuccess,
    userId,
    allowBackdate,
  });

  const {
    loading,
    startDate,
    endDate,
    category,
    subCategory,
    timeValue,
    returnTime,
    reason,
    showWarning,
    pendingPayload,
    calculatedDays,
    isAutoEndDate,
    fpDatang,
    fpPulang,
    lupaFp,
    errorFp,
    jamDatang,
    jamPulang,
    file,
    attachmentLink,
    isSakitHariPertama,
    isSakitHariBerikutnya,
    suratTerlampir,
    suratTidakTerlampir,
    hasSickHistory,
    isLoadingSickHistory,
  } = states;

  const {
    setStartDate,
    setEndDate,
    setSubCategory,
    setTimeValue,
    setReturnTime,
    setReason,
    handleCategoryChange,
    isHolidayOrSunday,
    handleSubmit,
    processSubmit,
    setShowWarning,
    setPendingPayload,
    setFpDatang,
    setFpPulang,
    setLupaFp,
    setErrorFp,
    setJamDatang,
    setJamPulang,
    setFile,
    setAttachmentLink,
    setIsSakitHariPertama,
    setIsSakitHariBerikutnya,
    setSuratTerlampir,
    setSuratTidakTerlampir,
  } = actions;

  const isHourlyPermission = ["Terlambat", "PulangAwal", "IzinKeluar"].includes(
    category,
  );

  const onCategorySelect = (val: string | null) => {
    handleCategoryChange(val);
    if (val === "IzinKeluar" && !allowBackdate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setStartDate(today);
      setEndDate(today);
    }
  };

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // --- LOGIKA PERHITUNGAN KUOTA IZIN KELUAR ---
  const isGuru = user.isGuru === true; // Pastikan Anda mengambil status isGuru
  const sisaKuota = sisaIzinKeluar ?? user.sisaIzinKeluar ?? 6;

  let requestedHours = 0;
  if (category === "IzinKeluar" && timeValue && returnTime) {
    const [startH, startM] = timeValue.split(":").map(Number);
    const [endH, endM] = returnTime.split(":").map(Number);
    const diffMins = endH * 60 + endM - (startH * 60 + startM);
    if (diffMins > 0) {
      requestedHours = diffMins / 60;
    }
  }

  // Hanya hitung exceeded quota jika user adalah GURU
  const isExceedingQuota =
    isGuru &&
    category === "IzinKeluar" &&
    (sisaKuota <= 0 || requestedHours > sisaKuota);
  // --------------------------------------------
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 px-1 pb-4">
        {/* INFO USER */}
        <div className="bg-slate-900/50 p-3 rounded-md text-sm border border-slate-700 space-y-1 text-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Nama:</span>
            <span className="font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Divisi:</span>
            <span className="font-semibold">
              {(typeof user.divisi === "object" && user.divisi !== null
                ? user.divisi.name
                : user.divisi) || "-"}
            </span>
          </div>
        </div>

        {/* KATEGORI */}
        <div className="space-y-2">
          <Label className="text-slate-300">Jenis Izin</Label>
          <Select value={category} onValueChange={onCategorySelect} required>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
              <SelectValue placeholder="Pilih jenis izin" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
              <SelectItem value="Sakit">Sakit</SelectItem>
              <SelectItem value="Izin">Izin Pribadi</SelectItem>
              <SelectItem value="NoFP">
                Lupa / Error Fingerprint (No FP)
              </SelectItem>
              <SelectItem value="Dinas">
                Dinas Luar (Wajib Surat Tugas)
              </SelectItem>
              <SelectItem value="IzinKeluar">
                Izin Keluar (Meninggalkan Kantor)
              </SelectItem>
              <SelectItem value="Terlambat">Terlambat Masuk</SelectItem>
              <SelectItem value="PulangAwal">Pulang Lebih Awal</SelectItem>
              <SelectItem value="IzinKhusus">Izin Khusus</SelectItem>
            </SelectContent>
          </Select>

          {/* MENAMPILKAN SISA KUOTA IZIN KELUAR */}
          {category === "IzinKeluar" && isGuru && (
            <div className="flex items-center gap-2 p-2 mt-2 text-xs rounded-md border bg-blue-950/40 border-blue-900/50 text-blue-300">
              <Clock className="h-4 w-4 opacity-70" />
              <span>
                Sisa Kuota Izin Keluar Anda:{" "}
                <b className="text-blue-400">{sisaKuota} Jam</b>
              </span>
            </div>
          )}
        </div>

        {/* CHECKBOX SAKIT */}
        {category === "Sakit" && (
          <div className="flex flex-col gap-3 p-3 bg-slate-900/50 rounded border border-slate-700">
            <Label className="text-slate-300">Keterangan Sakit</Label>
            <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isSakitHariPertama}
                onChange={() => {
                  setIsSakitHariPertama(true);
                  setIsSakitHariBerikutnya(false);
                }}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
              />
              Sakit (hari pertama)
            </label>
            <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isSakitHariBerikutnya}
                onChange={() => {
                  setIsSakitHariBerikutnya(true);
                  setIsSakitHariPertama(false);
                }}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
              />
              Sakit hari berikutnya jika masuk lebih dari 1 hari (diisi saat
              masuk kerja hari 1 setelah izin)
            </label>
          </div>
        )}

        {/* TANGGAL */}
        {category === "Sakit" &&
        isSakitHariBerikutnya &&
        isLoadingSickHistory ? (
          <div className="flex items-center gap-2 p-3 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> Memeriksa
            riwayat sakit...
          </div>
        ) : category === "Sakit" &&
          isSakitHariBerikutnya &&
          hasSickHistory === false ? (
          <div className="flex items-center gap-2 p-3 text-sm rounded-md border bg-red-950/40 border-red-900/50 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Anda tidak pernah mengajukan sakit sebelumnya
          </div>
        ) : category !== "Sakit" ||
          isSakitHariPertama ||
          (isSakitHariBerikutnya && hasSickHistory) ? (
          <div
            className={cn(
              "grid gap-4",
              (category === "Sakit" && isSakitHariPertama) ||
                category === "NoFP" ||
                isHourlyPermission
                ? "grid-cols-1"
                : "grid-cols-2",
            )}
          >
            <div className="space-y-2 flex flex-col">
              <Label className="text-slate-300">
                {category === "Sakit" && isSakitHariBerikutnya
                  ? "Tanggal Pengajuan Sakit Hari Pertama"
                  : "Tanggal"}
              </Label>
              <Popover>
                <PopoverTrigger
                  disabled={
                    (category === "IzinKeluar" && !allowBackdate) ||
                    (category === "Sakit" && isSakitHariBerikutnya)
                  }
                >
                  <div
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 w-full",
                      !startDate && "text-slate-400",
                      ((category === "IzinKeluar" && !allowBackdate) ||
                        (category === "Sakit" && isSakitHariBerikutnya)) &&
                        "opacity-60 cursor-not-allowed",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(startDate, "PPP", { locale: id })
                      : "Pilih tanggal"}
                  </div>
                </PopoverTrigger>
                {!(category === "Sakit" && isSakitHariBerikutnya) && (
                  <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => {
                        if (category === "NoFP" || allowBackdate) return false;
                        return date < todayDate;
                      }}
                      modifiers={{ holiday: isHolidayOrSunday }}
                      modifiersClassNames={{
                        holiday: "text-red-500 font-bold",
                      }}
                    />
                  </PopoverContent>
                )}
              </Popover>
            </div>

            {!(category === "Sakit" && isSakitHariPertama) &&
              category !== "NoFP" &&
              !isHourlyPermission && (
                <div className="space-y-2 flex flex-col">
                  <Label className="text-slate-300">
                    {category === "Sakit" && isSakitHariBerikutnya
                      ? "Sampai Dengan"
                      : "Tanggal Selesai"}
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      disabled={
                        isAutoEndDate ||
                        (category === "IzinKeluar" && !allowBackdate)
                      }
                    >
                      <div
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 w-full",
                          !endDate && "text-slate-400",
                          (isAutoEndDate ||
                            (category === "IzinKeluar" && !allowBackdate)) &&
                            "opacity-60 cursor-not-allowed",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate
                          ? format(endDate, "PPP", { locale: id })
                          : "Pilih tanggal"}
                      </div>
                    </PopoverTrigger>
                    {!(
                      isAutoEndDate ||
                      (category === "IzinKeluar" && !allowBackdate)
                    ) && (
                      <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => {
                            if (category === "NoFP" || allowBackdate)
                              return false;
                            return date < todayDate;
                          }}
                          modifiers={{ holiday: isHolidayOrSunday }}
                          modifiersClassNames={{
                            holiday: "text-red-500 font-bold",
                          }}
                        />
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
              )}
          </div>
        ) : null}

        {/* INFO DURASI */}
        {(startDate || (category === "Sakit" && isSakitHariPertama)) &&
          endDate &&
          (!isSakitHariBerikutnya || hasSickHistory) && (
            <div
              className={cn(
                "flex flex-col gap-1 p-3 text-sm rounded-md border",
                calculatedDays > 0 || isHourlyPermission || category === "NoFP"
                  ? "bg-blue-950/40 border-blue-900/50 text-blue-200"
                  : "bg-red-950/40 border-red-900/50 text-red-200",
              )}
            >
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 opacity-70" />
                <span>
                  {calculatedDays < 0 ? (
                    "Tanggal selesai tidak valid!"
                  ) : calculatedDays === 0 &&
                    !isHourlyPermission &&
                    category !== "NoFP" ? (
                    "Durasi 0 hari (Hari libur)."
                  ) : isHourlyPermission ? (
                    <>
                      Tipe Pengajuan:{" "}
                      <b className="text-blue-400">Izin Berbasis Jam</b>
                    </>
                  ) : category === "NoFP" ? (
                    <>
                      Tipe Pengajuan:{" "}
                      <b className="text-blue-400">Lupa/Error Fingerprint</b>
                    </>
                  ) : (
                    <>
                      Durasi Izin:{" "}
                      <b className="text-blue-400">
                        {subCategory?.includes("Pegawai melahirkan")
                          ? 60
                          : calculatedDays}{" "}
                        {subCategory?.includes("Pegawai melahirkan")
                          ? "Hari Kalender"
                          : "Hari Kerja"}
                      </b>
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

        {/* SURAT DOKTER CHECKBOX (> 1 Hari) */}
        {category === "Sakit" &&
          isSakitHariBerikutnya &&
          calculatedDays > 1 &&
          hasSickHistory && (
            <div className="flex flex-col gap-3 p-3 bg-slate-900/50 rounded border border-slate-700">
              <Label className="text-slate-300">
                Lampiran Surat Dokter (Durasi &gt; 1 Hari)
              </Label>
              <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={suratTerlampir}
                  onChange={() => {
                    setSuratTerlampir(true);
                    setSuratTidakTerlampir(false);
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                />
                Terlampir surat dokter (surat dokter harap diserahkan ke atasan)
              </label>
              <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={suratTidakTerlampir}
                  onChange={() => {
                    setSuratTidakTerlampir(true);
                    setSuratTerlampir(false);
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                />
                Tidak terlampir surat dokter
              </label>
            </div>
          )}

        {/* INPUT NO FP */}
        {category === "NoFP" && (
          <div className="p-3 bg-slate-900/50 rounded border border-slate-700 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Pilih Alasan</Label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="noFpReason"
                    checked={lupaFp}
                    onChange={() => {
                      setLupaFp(true);
                      setErrorFp(false);
                    }}
                    className="w-4 h-4 border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                  />
                  Lupa Fingerprint
                </label>
                <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="noFpReason"
                    checked={errorFp}
                    onChange={() => {
                      setErrorFp(true);
                      setLupaFp(false);
                    }}
                    className="w-4 h-4 border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                  />
                  Fingerprint Error
                </label>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-700">
              <Label className="text-slate-300">
                Pilih Waktu Lupa/Error FP
              </Label>
              <div className="flex flex-col gap-4 mt-1">
                {/* FP Datang */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fpDatang}
                      onChange={(e) => {
                        setFpDatang(e.target.checked);
                        if (!e.target.checked) setJamDatang("");
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                    />
                    FP Datang (Masuk)
                  </label>
                  {fpDatang && (
                    <div className="ml-6 space-y-1">
                      <Label className="text-xs text-slate-400">
                        Jam Datang Seharusnya
                      </Label>
                      <Input
                        type="time"
                        value={jamDatang}
                        onChange={(e) => setJamDatang(e.target.value)}
                        className="w-full bg-slate-900 border-slate-700 text-slate-100 h-8 text-sm"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* FP Pulang */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-slate-200 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fpPulang}
                      onChange={(e) => {
                        setFpPulang(e.target.checked);
                        if (!e.target.checked) setJamPulang("");
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                    />
                    FP Pulang (Keluar)
                  </label>
                  {fpPulang && (
                    <div className="ml-6 space-y-1">
                      <Label className="text-xs text-slate-400">
                        Jam Pulang Seharusnya
                      </Label>
                      <Input
                        type="time"
                        value={jamPulang}
                        onChange={(e) => setJamPulang(e.target.value)}
                        className="w-full bg-slate-900 border-slate-700 text-slate-100 h-8 text-sm"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-700">
              <Label className="text-slate-300">
                Bukti Lampiran (Pilih Salah Satu)
              </Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-slate-900 border-slate-700 text-slate-100 cursor-pointer"
                accept="image/*"
              />
              <span className="text-xs text-slate-400 block text-center">
                Atau unggah via link foto
              </span>
              <Input
                type="url"
                placeholder="Masukkan Link Foto (Google Drive, dll)"
                value={attachmentLink}
                onChange={(e) => setAttachmentLink(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100"
              />
            </div>
          </div>
        )}

        {/* TIPE IZIN KHUSUS */}
        {category === "IzinKhusus" && (
          <div className="space-y-2">
            <Label className="text-slate-300">Kategori Izin Khusus</Label>
            <span className="text-xs text-orange-400 font-bold">
              *Sesuai dengan peraturan kepegawaian pasal 47
            </span>
            <Select
              value={subCategory}
              onValueChange={(val) => setSubCategory(val || "")}
              required
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                <SelectValue placeholder="Pilih kategori izin khusus" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectItem value="Pegawai menikah (5 Hari)">
                  Pegawai menikah (5 Hari)
                </SelectItem>
                <SelectItem value="Pegawai menikahkan anaknya (2 Hari)">
                  Pegawai menikahkan anaknya (2 Hari)
                </SelectItem>
                <SelectItem value="Pegawai mengkhitankan/membaptiskan anaknya/Wisuda/meja hijau (1 Hari)">
                  Pegawai mengkhitankan/membaptiskan anaknya/Wisuda/meja hijau
                  (1 Hari)
                </SelectItem>
                <SelectItem value="Pegawai melahirkan (2 Bulan kalender)">
                  Pegawai melahirkan (2 Bulan kalender)
                </SelectItem>
                <SelectItem value="Istri pegawai melahirkan/keguguran kandungan (2 Hari)">
                  Istri pegawai melahirkan/keguguran kandungan (2 Hari)
                </SelectItem>
                <SelectItem value="Suami/istri/anak/orang tua/mertua/menantu/saudara kandung meninggal dunia (5 Hari)">
                  Suami/istri/anak/orang tua/mertua/menantu/saudara kandung
                  meninggal dunia (5 Hari)
                </SelectItem>
                <SelectItem value="Force Majeur/musibah bencana alam (1 Hari)">
                  Force Majeur/musibah bencana alam (1 Hari)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* INPUT WAKTU (IZIN KELUAR / JAM-JAMAN) */}
        {isHourlyPermission && (
          <div className="space-y-4">
            <div
              className={cn(
                "p-3 bg-blue-950/30 rounded border border-blue-900/50",
                category === "IzinKeluar"
                  ? "grid grid-cols-2 gap-4"
                  : "space-y-2",
              )}
            >
              <div className="space-y-2">
                <Label className="text-blue-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" />{" "}
                  {category === "Terlambat"
                    ? "Jam Perkiraan Tiba"
                    : category === "PulangAwal"
                      ? "Jam Rencana Keluar"
                      : "Jam Keluar"}
                </Label>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="w-full bg-slate-900 border-slate-700 text-slate-100"
                  required
                />
              </div>

              {category === "IzinKeluar" && (
                <div className="space-y-2">
                  <Label className="text-blue-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Jam Kembali
                  </Label>
                  <Input
                    id="returnTime"
                    name="returnTime"
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-slate-900 border-slate-700 text-slate-100"
                    required
                  />
                </div>
              )}
            </div>

            {/* --- KOTAK INFO DURASI (Tampil Selama Jam Terisi) --- */}
            {category === "IzinKeluar" && requestedHours > 0 && (
              <div className="flex flex-col gap-2 p-3 text-sm rounded-md border bg-slate-900/80 border-slate-700 text-slate-300">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span>Durasi Diajukan:</span>
                  <span className="font-bold text-blue-400">
                    {requestedHours.toFixed(1)} Jam
                  </span>
                </div>

                {/* Tampilkan sisa kuota HANYA JIKA GURU */}
                {isGuru && (
                  <div className="flex justify-between items-center pt-1">
                    <span>Sisa Kuota Anda:</span>
                    <span
                      className={cn(
                        "font-bold",
                        isExceedingQuota ? "text-red-400" : "text-blue-400",
                      )}
                    >
                      {sisaKuota} Jam
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* --- KOTAK PERINGATAN (Hanya Tampil Jika Melebihi Kuota) --- */}
            {isExceedingQuota && (
              <div className="flex items-start gap-3 p-3 text-sm rounded-md border bg-red-950/40 border-red-900/50 text-red-400">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="font-semibold text-red-300">
                    Peringatan Kuota Izin Keluar
                  </p>
                  <p className="mt-1">
                    {sisaKuota <= 0
                      ? "Kuota izin keluar Anda sudah habis."
                      : "Durasi izin yang diajukan melebihi sisa kuota Anda."}
                    <br />
                    Pengajuan ini akan mengakibatkan{" "}
                    <b className="text-red-300">pemotongan</b>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ALASAN LENGKAP */}
        {!(category === "Sakit" && isSakitHariBerikutnya) && (
          <div className="space-y-2 mt-4">
            <Label className="text-slate-300">
              Keterangan / Alasan Lengkap
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="bg-slate-900 border-slate-700 text-slate-100 min-h-[80px]"
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={
            loading ||
            (category === "Sakit" &&
              isSakitHariBerikutnya &&
              hasSickHistory === false) ||
            (!isHourlyPermission &&
              category !== "Dinas" &&
              category !== "NoFP" &&
              calculatedDays <= 0 &&
              !isAdmin)
          }
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
            </>
          ) : (
            "Kirim Pengajuan"
          )}
        </Button>
      </form>

      {/* ALERT DIALOG (WARNING) */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Peringatan Pemotongan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 mt-2">
              Pengajuan <b>Izin Pribadi</b> akan mengakibatkan{" "}
              <b>pemotongan Gaji Pokok</b>. Yakin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-slate-800 border-slate-700 text-slate-200"
              onClick={() => setPendingPayload(null)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (pendingPayload) {
                  processSubmit(pendingPayload);
                }
              }}
            >
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
