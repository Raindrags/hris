"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, CalendarIcon, Calculator, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type LeaveUserData = {
  sisaCuti: number | string;
  [key: string]: unknown;
};

export type LeaveSubmitPayload = {
  startDate: string;
  endDate: string;
  reason: string;
};

interface LeaveFormProps {
  user: LeaveUserData;
  onSuccess: () => void;
}

const getLocalYYYYMMDD = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export function LeaveForm({ user, onSuccess }: LeaveFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [holidays, setHolidays] = useState<string[]>([]);
  const [reason, setReason] = useState<string>("");
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [pendingPayload, setPendingPayload] =
    useState<LeaveSubmitPayload | null>(null);

  const sisaCutiNum = Number(user.sisaCuti) || 0;

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/holidays`);
        if (!res.ok) throw new Error("Gagal mengambil data libur");
        const data = await res.json();
        setHolidays(data);
      } catch (error) {
        console.error("Gagal mengambil data libur:", error);
        setHolidays([]);
      }
    };
    fetchHolidays();
  }, []);

  const isHolidayOrSunday = (date: Date) => {
    if (date.getDay() === 0) return true;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
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

  const excessDays =
    calculatedDays > sisaCutiNum ? calculatedDays - sisaCutiNum : 0;

  const processSubmit = async (payload: LeaveSubmitPayload) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/cuti`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Pengajuan cuti berhasil dikirim.");
        onSuccess();
      } else {
        toast.error(data.message || "Gagal mengajukan cuti.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim data. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
      setShowWarning(false);
      setPendingPayload(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Silakan pilih tanggal mulai dan selesai.");
      return;
    }
    if (calculatedDays < 0) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }
    if (calculatedDays === 0) {
      toast.error("Durasi 0 hari. Anda hanya memilih hari libur.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Silakan isi alasan cuti Anda.");
      return;
    }

    const payload: LeaveSubmitPayload = {
      startDate: getLocalYYYYMMDD(startDate),
      endDate: getLocalYYYYMMDD(endDate),
      reason: reason,
    };

    if (excessDays > 0) {
      setPendingPayload(payload);
      setShowWarning(true);
    } else {
      processSubmit(payload);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 px-1">
        <div className="bg-slate-900/50 p-3 rounded-md text-sm border border-slate-700 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Sisa Cuti Tahunan:</span>{" "}
            <b
              className={cn(
                sisaCutiNum > 0 ? "text-green-400" : "text-red-400",
              )}
            >
              {sisaCutiNum} Hari
            </b>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tanggal Mulai */}
          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-900 border-slate-700"
                align="start"
              >
                {/* Calendar */}
              </PopoverContent>
            </Popover>
          </div>

          {/* Tanggal Selesai */}
          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300">Tanggal Selesai</Label>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-100",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-900 border-slate-700"
                align="start"
              >
                {/* Calendar */}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {startDate && endDate && (
          <div
            className={cn(
              "flex flex-col gap-1 p-3 text-sm rounded-md border",
              calculatedDays > 0 && excessDays === 0
                ? "bg-blue-950/40 border-blue-900/50 text-blue-200"
                : calculatedDays <= 0
                  ? "bg-red-950/40 border-red-900/50 text-red-200"
                  : "bg-amber-950/40 border-amber-900/50 text-amber-200",
            )}
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 opacity-70" />
              <span>
                {calculatedDays < 0 ? (
                  "Tanggal selesai tidak valid!"
                ) : calculatedDays === 0 ? (
                  "Durasi 0 hari (Anda memilih hari libur)."
                ) : (
                  <>
                    Estimasi pengajuan:{" "}
                    <b className="text-blue-400">{calculatedDays} Hari Kerja</b>
                  </>
                )}
              </span>
            </div>
            {excessDays > 0 && calculatedDays > 0 && (
              <span className="text-xs text-amber-400 ml-6">
                *Melebihi sisa cuti ({sisaCutiNum} hari). {excessDays} hari akan
                dihitung sebagai Izin Pribadi.
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-slate-300">Alasan Cuti</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan keperluan cuti Anda..."
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
            "Kirim Pengajuan Cuti"
          )}
        </Button>
      </form>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Sisa Cuti Tidak Mencukupi
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 mt-2 space-y-2">
              <p>
                Anda mengajukan cuti selama <b>{calculatedDays} hari</b>, namun
                sisa cuti tahunan Anda hanya <b>{sisaCutiNum} hari</b>.
              </p>
              <p>
                Kelebihan pengajuan sebanyak <b>{excessDays} hari</b> akan
                otomatis dialihkan menjadi <b>Izin Pribadi</b> dan akan{" "}
                <b>dikenakan pemotongan gaji/tunjangan</b> sesuai peraturan
                perusahaan.
              </p>
              <p className="pt-2">
                Apakah Anda yakin ingin melanjutkan pengajuan ini?
              </p>
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
              className="bg-gray-900 hover:bg-amber-700 text-gray-500 border-none"
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
