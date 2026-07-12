"use client";

import { useState } from "react";
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
  UploadCloud,
  Link2,
  FileText,
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
}

export default function PermissionForm({
  user,
  potentialSubstitutes = [],
  onSuccess,
  userId,
}: PermissionFormProps) {
  const { states, actions } = usePermissionForm({
    user,
    potentialSubstitutes,
    onSuccess,
    userId,
  });

  const {
    loading,
    startDate,
    endDate,
    category,
    timeValue,
    returnTime,
    attachmentLink,
    reason,
    showWarning,
    pendingPayload,
    calculatedDays,
    isAutoEndDate,
  } = states;

  const {
    setStartDate,
    setEndDate,
    setTimeValue,
    setReturnTime,
    setAttachmentLink,
    setReason,
    setFile,
    setPendingPayload,
    handleCategoryChange,
    isHolidayOrSunday,
    handleSubmit,
    processSubmit,
    setShowWarning,
  } = actions;
  const [dinasMethod, setDinasMethod] = useState<"file" | "link">("file");
  const isHourlyPermission = ["Terlambat", "PulangAwal", "IzinKeluar"].includes(
    category,
  );

  const onCategorySelect = (val: string) => {
    handleCategoryChange(val);
    setReturnTime("");
    setAttachmentLink("");
    setFile(null); // Reset file bawaan hook

    if (val === "IzinKeluar") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setStartDate(today);
      setEndDate(today);
    }
  };

  // MENCEGAT SUBMIT UNTUK VALIDASI EXTRA
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (category === "IzinKeluar") {
      if (!timeValue || !returnTime) {
        alert("Jam Keluar dan Jam Kembali wajib diisi!");
        return;
      }
    }

    // 🆕 Validasi Lampiran Dinas
    if (category === "Dinas") {
      if (dinasMethod === "link" && !attachmentLink.trim()) {
        alert("Link Surat Tugas wajib diisi!");
        return;
      }
    }

    handleSubmit(e);
  };

  return (
    <>
      <form onSubmit={onFormSubmit} className="space-y-4 px-1 pb-4">
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

        {/* TANGGAL */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger disabled={category === "IzinKeluar"}>
                <div
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 w-full",
                    !startDate && "text-slate-400",
                    category === "IzinKeluar" &&
                      "opacity-60 cursor-not-allowed",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(startDate, "PPP", { locale: id })
                    : "Pilih tanggal"}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  modifiers={{ holiday: isHolidayOrSunday }}
                  modifiersClassNames={{ holiday: "text-red-500 font-bold" }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300">Tanggal Selesai</Label>
            <Popover>
              <PopoverTrigger
                disabled={isAutoEndDate || category === "IzinKeluar"}
              >
                <div
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 w-full",
                    !endDate && "text-slate-400",
                    (isAutoEndDate || category === "IzinKeluar") &&
                      "opacity-60 cursor-not-allowed",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate
                    ? format(endDate, "PPP", { locale: id })
                    : "Pilih tanggal"}
                </div>
              </PopoverTrigger>
              {!(isAutoEndDate || category === "IzinKeluar") && (
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    modifiers={{ holiday: isHolidayOrSunday }}
                    modifiersClassNames={{ holiday: "text-red-500 font-bold" }}
                  />
                </PopoverContent>
              )}
            </Popover>
          </div>
        </div>

        {/* INFO DURASI */}
        {startDate && endDate && (
          <div
            className={cn(
              "flex flex-col gap-1 p-3 text-sm rounded-md border",
              calculatedDays > 0 || isHourlyPermission
                ? "bg-blue-950/40 border-blue-900/50 text-blue-200"
                : "bg-red-950/40 border-red-900/50 text-red-200",
            )}
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 opacity-70" />
              <span>
                {calculatedDays < 0 ? (
                  "Tanggal selesai tidak valid!"
                ) : calculatedDays === 0 && !isHourlyPermission ? (
                  "Durasi 0 hari (Hari libur)."
                ) : isHourlyPermission ? (
                  <>
                    Tipe Pengajuan:{" "}
                    <b className="text-blue-400">Izin Berbasis Jam</b>
                  </>
                ) : (
                  <>
                    Durasi Izin:{" "}
                    <b className="text-blue-400">{calculatedDays} Hari Kerja</b>
                  </>
                )}
              </span>
            </div>
          </div>
        )}

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
        </div>

        {/* INPUT WAKTU (IZIN KELUAR / JAM-JAMAN) */}
        {isHourlyPermission && (
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
        )}

        {/* 🆕 INPUT DOKUMEN KHUSUS DINAS LUAR */}
        {category === "Dinas" && (
          <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-blue-400 flex items-center gap-1.5 font-medium">
                <FileText className="h-4 w-4" /> Dokumen Surat Tugas
              </Label>
              {/* Toggle Opsi File / Link */}
              <div className="flex rounded-md border border-slate-700 p-0.5 bg-slate-950 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDinasMethod("file");
                    setAttachmentLink("");
                  }}
                  className={cn(
                    "px-2 py-1 rounded",
                    dinasMethod === "file"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDinasMethod("link");
                    setFile(null);
                  }}
                  className={cn(
                    "px-2 py-1 rounded",
                    dinasMethod === "link"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  Input Link
                </button>
              </div>
            </div>

            {dinasMethod === "file" ? (
              <div className="space-y-1.5">
                <div className="relative flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-4 bg-slate-900 hover:bg-slate-800/80 transition-colors cursor-pointer group">
                  <Input
                    type="file"
                    name="file"
                    // Membatasi ekstensi dokumen yang diminta: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx)
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required
                  />
                  <div className="text-center space-y-1 text-slate-400 group-hover:text-slate-300">
                    <UploadCloud className="h-8 w-8 mx-auto text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <p className="text-xs font-medium">
                      Klik atau seret file ke sini
                    </p>
                    <p className="text-[10px] text-slate-500">
                      PDF, DOC, DOCX, PPT, PPTX (Maks 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                <div className="relative">
                  <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="url"
                    placeholder="https://drive.google.com/share-link-surat-tugas"
                    value={attachmentLink}
                    onChange={(e) => setAttachmentLink(e.target.value)}
                    className="pl-9 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500 pl-1">
                  Pastikan hak akses link Google Drive/OneDrive diatur ke 'Siapa
                  saja yang memiliki link'.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ALASAN LENGKAP */}
        <div className="space-y-2 mt-4">
          <Label className="text-slate-300">Keterangan / Alasan Lengkap</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="bg-slate-900 border-slate-700 text-slate-100 min-h-[80px]"
          />
        </div>

        {/* HIDDEN INPUTS UNTUK COMPATIBILITY FORMDATA HOOK */}
        <input type="hidden" name="returnTime" value={returnTime} />
        <input type="hidden" name="attachmentLink" value={attachmentLink} />

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={
            loading ||
            (!isHourlyPermission && category !== "Dinas" && calculatedDays <= 0)
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
              {category === "IzinKeluar"
                ? "Batas Akumulasi Terlampaui"
                : "Peringatan Pemotongan"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 mt-2">
              {category === "IzinKeluar" ? (
                <>
                  Pengajuan <b>Izin Keluar</b> Anda pada bulan berjalan{" "}
                  <b>telah melebihi kuota 6 jam</b>.<br />
                  <br />
                  Melanjutkan pengajuan ini akan mengakibatkan{" "}
                  <b>pemotongan upah/gaji secara proporsional</b>. Yakin tetap
                  melanjutkan?
                </>
              ) : (
                <>
                  Pengajuan <b>Izin Pribadi</b> akan mengakibatkan{" "}
                  <b>pemotongan Gaji Pokok</b>. Yakin melanjutkan?
                </>
              )}
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
                if (pendingPayload && category === "IzinKeluar")
                  pendingPayload.returnTime = returnTime;
                if (pendingPayload && category === "Dinas")
                  pendingPayload.attachmentLink = attachmentLink;
                processSubmit(pendingPayload);
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
