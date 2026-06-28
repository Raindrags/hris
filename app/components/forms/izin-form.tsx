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
  SelectGroup,
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
    subCategory,
    timeValue,
    reason,
    delegatedTo,
    taskDetail,
    showWarning,
    pendingPayload,
    calculatedDays,
    filteredSubstitutes,
    isAutoEndDate,
  } = states;

  const {
    setStartDate,
    setEndDate,
    setSubCategory,
    setTimeValue,
    setReason,
    setFile,
    setDelegatedTo,
    setTaskDetail,
    setShowWarning,
    setPendingPayload,
    handleCategoryChange,
    isHolidayOrSunday,
    handleSubmit,
    processSubmit,
  } = actions;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 px-1 pb-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger>
                <div
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 w-full",
                    !startDate && "text-slate-400",
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
              <PopoverTrigger disabled={isAutoEndDate}>
                <div
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 w-full",
                    !endDate && "text-slate-400",
                    isAutoEndDate && "opacity-50",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate
                    ? format(endDate, "PPP", { locale: id })
                    : "Pilih tanggal"}
                </div>
              </PopoverTrigger>
              {!isAutoEndDate && (
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

        {startDate && endDate && (
          <div
            className={cn(
              "flex flex-col gap-1 p-3 text-sm rounded-md border",
              calculatedDays > 0
                ? "bg-blue-950/40 border-blue-900/50 text-blue-200"
                : "bg-red-950/40 border-red-900/50 text-red-200",
            )}
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 opacity-70" />
              <span>
                {calculatedDays < 0 ? (
                  "Tanggal selesai tidak valid!"
                ) : calculatedDays === 0 ? (
                  "Durasi 0 hari (Hanya memilih hari libur)."
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

        <div className="space-y-2">
          <Label className="text-slate-300">Jenis Izin</Label>
          <Select
            value={category}
            onValueChange={handleCategoryChange}
            required
          >
            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
              <SelectValue placeholder="Pilih jenis izin" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
              <SelectItem value="Sakit">Sakit</SelectItem>
              <SelectItem value="Izin">Izin Pribadi</SelectItem>
              <SelectItem value="Dinas">Dinas Luar</SelectItem>
              <SelectItem value="Terlambat">Terlambat Masuk</SelectItem>
              <SelectItem value="PulangAwal">Pulang Lebih Awal</SelectItem>
              <SelectItem value="IzinKhusus">Izin Khusus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category !== "Terlambat" && category !== "PulangAwal" && (
          <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">
                Tugas Diserahkan Kepada (Opsional)
              </Label>
              <Select
                value={delegatedTo}
                onValueChange={(val) => setDelegatedTo(val ?? "")}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Pilih Rekan Pengganti" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectGroup>
                    {filteredSubstitutes.length === 0 ? (
                      <SelectItem
                        value="empty"
                        disabled
                        className="text-slate-500"
                      >
                        Tidak ada rekan satu divisi
                      </SelectItem>
                    ) : (
                      filteredSubstitutes.map((sub) => (
                        <SelectItem
                          key={sub.id}
                          value={sub.id}
                          className="text-slate-200"
                        >
                          {sub.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {delegatedTo && (
              <div className="space-y-2">
                <Label className="text-slate-300">
                  Rincian Tugas untuk Pengganti
                </Label>
                <Textarea
                  value={taskDetail}
                  onChange={(e) => setTaskDetail(e.target.value)}
                  placeholder="Jelaskan apa yang harus dikerjakan pengganti Anda..."
                  className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            )}
          </div>
        )}

        {category === "Sakit" && calculatedDays > 1 && (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded border border-slate-700">
            <Label className="text-amber-400 flex items-center gap-2">
              <UploadCloud className="h-4 w-4" /> Upload Surat Dokter
            </Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-slate-900 border-slate-700 text-slate-100 file:text-slate-100"
              required
            />
          </div>
        )}

        {(category === "Terlambat" || category === "PulangAwal") && (
          <div className="space-y-2 p-3 bg-blue-950/30 rounded border border-blue-900/50">
            <Label className="text-blue-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />{" "}
              {category === "Terlambat"
                ? "Jam Perkiraan Tiba"
                : "Jam Rencana Keluar"}
            </Label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-full bg-slate-900 border-slate-700 text-slate-100"
              required
            />
          </div>
        )}

        {category === "IzinKhusus" && (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded border border-slate-700">
            <Label className="text-slate-300">Detail Izin Khusus</Label>
            <Select
              value={delegatedTo}
              onValueChange={(val) => setDelegatedTo(val ?? "")}
            >
              ``
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                <SelectValue placeholder="Pilih alasan khusus" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectItem value="Melahirkan">Melahirkan (1 Bulan)</SelectItem>
                <SelectItem value="IstriMelahirkan">
                  Istri Melahirkan/Keguguran (2 Hari)
                </SelectItem>
                <SelectItem value="Bencana">Bencana Alam (1 hari)</SelectItem>
                <SelectItem value="KeluargaMeninggal">
                  Keluarga Meninggal (5 Hari)
                </SelectItem>
                <SelectItem value="Menikah">Menikah (5 Hari)</SelectItem>
                <SelectItem value="MenikahkanAnak">
                  Menikahkan Anak (2 Hari)
                </SelectItem>
                <SelectItem value="WisudaBaptis">
                  Wisuda / Baptis / Meja Hijau (1 Hari)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-slate-300">Keterangan / Alasan Lengkap</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="bg-slate-900 border-slate-700 text-slate-100 min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading || calculatedDays <= 0}
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

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" /> Peringatan Pemotongan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 mt-2">
              Pengajuan <b>Izin Pribadi</b> akan mengakibatkan{" "}
              <b>
                pemotongan Gaji Pokok, Tunjangan Konsumsi, dan Tunjangan
                Transportasi
              </b>{" "}
              sesuai dengan jumlah hari yang diajukan ({calculatedDays} hari).
              Yakin melanjutkan?
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
              onClick={() => pendingPayload && processSubmit(pendingPayload)}
            >
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
