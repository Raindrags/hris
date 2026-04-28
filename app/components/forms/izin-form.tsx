"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
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

export type PermissionUserData = {
  name: string;
  divisi?: {
    name: string;
  } | null;
  [key: string]: unknown;
};

export type PermissionSubmitPayload = {
  startDate: string;
  endDate: string;
  reason: string;
  category: string;
  subCategory: string | null;
  time: string | null;
  file?: File | null;
};

interface PermissionFormProps {
  user: PermissionUserData;
  onSuccess: () => void;
  userId?: string;
}

const getLocalYYYYMMDD = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export default function PermissionForm({
  user,
  onSuccess,
}: PermissionFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [holidays, setHolidays] = useState<string[]>([]);
  const [specialWorkDays, setSpecialWorkDays] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [pendingPayload, setPendingPayload] =
    useState<PermissionSubmitPayload | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("/api/holidays");
        if (!res.ok) throw new Error("Gagal fetch");
        const data = await res.json();

        let holidaysArray: string[] = [];
        if (Array.isArray(data)) {
          holidaysArray = data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        } else if (data?.data && Array.isArray(data.data)) {
          holidaysArray = data.data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        }
        setHolidays(holidaysArray);
      } catch (error) {
        console.warn("Penanda merah tidak akan muncul:", error);
        setHolidays([]);
      }
      console.log("Libur yang di-fetch:", holidays);
    };
    fetchHolidays();
  }, []);

  useEffect(() => {
    const fetchSpecialWorkDays = async () => {
      try {
        const res = await fetch("/api/special-workdays"); // atau endpoint yang sesuai
        if (!res.ok) throw new Error("Gagal fetch");
        const data = await res.json();

        let daysArray: string[] = [];
        if (Array.isArray(data)) {
          daysArray = data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        } else if (data?.data && Array.isArray(data.data)) {
          daysArray = data.data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        }
        setSpecialWorkDays(daysArray);
      } catch (error) {
        console.warn("Data hari kerja khusus tidak tersedia:", error);
        setSpecialWorkDays([]);
      }
    };
    fetchSpecialWorkDays();
  }, []);

  useEffect(() => {
    if (category === "IzinKhusus" && subCategory && startDate) {
      const newEndDate = new Date(startDate);
      let isAutoSet = true;
      switch (subCategory) {
        case "IstriMelahirkan":
        case "MenikahkanAnak":
          newEndDate.setDate(newEndDate.getDate() + 1);
          break;
        case "Menikah":
        case "KeluargaMeninggal":
          newEndDate.setDate(newEndDate.getDate() + 4);
          break;
        case "WisudaBaptis":
        case "Bencana":
          break;
        case "Melahirkan":
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          newEndDate.setDate(newEndDate.getDate() - 1);
          break;
        default:
          isAutoSet = false;
          break;
      }
      if (isAutoSet) setEndDate(newEndDate);
    }
  }, [category, subCategory, startDate]);

  const isHolidayOrSunday = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Jika tanggal terdaftar sebagai hari kerja khusus → bukan libur
    if (specialWorkDays.includes(dateString)) return false;

    // Hari Minggu tetap libur jika tidak termasuk dalam hari kerja khusus
    if (date.getDay() === 0) return true;

    // Cek daftar hari libur dari backend
    return holidays.includes(dateString);
  };

  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const lastDate = new Date(endDate);
    lastDate.setHours(0, 0, 0, 0);
    if (lastDate < currentDate) return -1;
    let count = 0;
    while (currentDate <= lastDate) {
      if (!isHolidayOrSunday(currentDate)) count++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, holidays]);

  const processSubmit = async (payload: PermissionSubmitPayload) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formDataObj = new FormData();
      formDataObj.append(
        "startDate",
        new Date(payload.startDate).toISOString(),
      );
      formDataObj.append("endDate", new Date(payload.endDate).toISOString());
      formDataObj.append("reason", payload.reason);
      formDataObj.append("category", payload.category);
      if (payload.subCategory)
        formDataObj.append("subCategory", payload.subCategory);
      if (payload.time) formDataObj.append("time", payload.time);
      if (payload.file) formDataObj.append("file", payload.file);
      if (userId) formDataObj.append("userId", userId);

      const res = await fetch("/api/izin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Pengajuan izin berhasil dikirim.");
        onSuccess();
      } else {
        toast.error(data.message || "Gagal mengajukan izin.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Gagal memproses pengajuan. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
      setShowWarning(false);
      setPendingPayload(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Mohon pilih tanggal mulai dan selesai.");
      return;
    }
    if (calculatedDays < 0) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }
    if (!category) {
      toast.error("Mohon pilih jenis izin.");
      return;
    }
    if (category === "IzinKhusus" && !subCategory) {
      toast.error("Mohon pilih detail izin khusus.");
      return;
    }
    if ((category === "Terlambat" || category === "PulangAwal") && !timeValue) {
      toast.error("Mohon masukkan jam/waktu yang sesuai.");
      return;
    }
    if (category === "Sakit" && calculatedDays > 1 && !file) {
      toast.error(
        "Mohon lampirkan surat dokter/bukti untuk izin sakit lebih dari 1 hari.",
      );
      return;
    }
    if (!reason.trim()) {
      toast.error("Mohon isi keterangan / alasan lengkap.");
      return;
    }

    const finalData: PermissionSubmitPayload = {
      startDate: getLocalYYYYMMDD(startDate),
      endDate: getLocalYYYYMMDD(endDate),
      reason: reason,
      category: category,
      subCategory: category === "IzinKhusus" ? subCategory : null,
      time:
        category === "Terlambat" || category === "PulangAwal"
          ? timeValue
          : null,
      file: category === "Sakit" && calculatedDays > 1 ? file : null,
    };

    if (category === "Izin") {
      setPendingPayload(finalData);
      setShowWarning(true);
    } else {
      processSubmit(finalData);
    }
  };

  const isAutoEndDate =
    category === "IzinKhusus" &&
    [
      "IstriMelahirkan",
      "Menikah",
      "WisudaBaptis",
      "MenikahkanAnak",
      "KeluargaMeninggal",
      "Melahirkan",
    ].includes(subCategory);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 px-1">
        <div className="bg-slate-900/50 p-3 rounded-md text-sm border border-slate-700 space-y-1 text-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Nama:</span>
            <span className="font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Divisi:</span>
            <span className="font-semibold">{user.divisi?.name || "-"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger>
                <span
                  className={cn(
                    "inline-flex w-full cursor-pointer items-center justify-start rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-normal text-slate-100 hover:bg-slate-800",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(startDate, "PPP", { locale: id })
                    : "Pilih tanggal"}
                </span>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-900 border-slate-700"
                align="start"
              >
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
              <PopoverTrigger>
                <span
                  className={cn(
                    "inline-flex w-full cursor-pointer items-center justify-start rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-normal text-slate-100 hover:bg-slate-800",
                    !endDate && "text-muted-foreground",
                    isAutoEndDate &&
                      "pointer-events-none opacity-50 cursor-not-allowed",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate
                    ? format(endDate, "PPP", { locale: id })
                    : "Pilih tanggal"}
                </span>
              </PopoverTrigger>
              {!isAutoEndDate && (
                <PopoverContent
                  className="w-auto p-0 bg-slate-900 border-slate-700"
                  align="start"
                >
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
            {isAutoEndDate && (
              <p className="text-xs text-blue-400/80 mt-1 italic ml-6">
                *Tanggal selesai diatur otomatis berdasarkan kebijakan izin
                khusus.
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-slate-300">Jenis Izin</Label>
          <Select
            value={category}
            onValueChange={(val) => {
              const safeVal = val ?? "";
              setCategory(safeVal);
              if (safeVal !== "IzinKhusus") setSubCategory("");
              if (safeVal !== "Terlambat" && safeVal !== "PulangAwal")
                setTimeValue("");
            }}
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

        {category === "Sakit" && calculatedDays > 1 && (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded border border-slate-700">
            <Label className="text-amber-400 flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              Upload Surat Dokter / Bukti Sakit
            </Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-slate-900 border-slate-700 text-slate-100 file:text-slate-100"
              required
            />
            <p className="text-xs text-amber-500/80">
              *Wajib melampirkan surat dokter karena izin sakit melebihi 1 hari
              kerja.
            </p>
          </div>
        )}

        {(category === "Terlambat" || category === "PulangAwal") && (
          <div className="space-y-2 p-3 bg-blue-950/30 rounded border border-blue-900/50">
            <Label className="text-blue-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {category === "Terlambat"
                ? "Jam Perkiraan Tiba"
                : "Jam Rencana Keluar"}
            </Label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-full bg-slate-900 border-slate-700 text-slate-100 dark:[color-scheme:dark]"
              required
            />
            <p className="text-xs text-blue-300/80">
              {category === "Terlambat"
                ? "Masukkan estimasi jam Anda akan sampai di kantor."
                : "Masukkan jam Anda berencana untuk meninggalkan kantor."}
            </p>
          </div>
        )}

        {category === "IzinKhusus" && (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded border border-slate-700">
            <Label className="text-slate-300">Detail Izin Khusus</Label>
            <Select
              value={subCategory}
              onValueChange={(val) => setSubCategory(val ?? "")}
            >
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
            placeholder={
              category === "Sakit"
                ? "Sakit apa? (Lampirkan surat dokter jika > 1 hari)"
                : "Jelaskan alasan pengajuan secara detail..."
            }
            required
            className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none"
          disabled={loading || calculatedDays <= 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
            </>
          ) : (
            "Kirim Pengajuan Izin"
          )}
        </Button>
      </form>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Peringatan Pemotongan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 mt-2">
              Pengajuan <b>Izin Pribadi</b> akan mengakibatkan{" "}
              <b>
                pemotongan Gaji Pokok, Tunjangan Konsumsi, dan Tunjangan
                Transportasi
              </b>{" "}
              sesuai dengan jumlah hari yang Anda ajukan ({calculatedDays}{" "}
              hari).
              <br />
              <br />
              Apakah Anda yakin ingin melanjutkan pengajuan ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
              onClick={() => setPendingPayload(null)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-none"
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
