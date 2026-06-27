// app/components/forms/cuti-form.tsx

"use client";

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
import { Loader2, CalendarIcon, Calculator, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLeaveForm } from "./hooks/useLeaveForm";
import { LeaveFormProps } from "./types";

export function LeaveForm({ user, onSuccess, userId }: LeaveFormProps) {
  // Destructure logika dari custom hook
  const {
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    showWarning,
    setShowWarning,
    pendingPayload,
    setPendingPayload,
    sisaCutiNum,
    calculatedDays,
    excessDays,
    isHolidayOrSunday,
    handleSubmit,
    processSubmit,
  } = useLeaveForm(user.sisaCuti, userId, onSuccess);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner Sisa Cuti */}
        <div className="bg-slate-900/50 p-4 rounded-xl text-sm border border-slate-700/60 shadow-inner space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">
              Sisa Cuti Tahunan:
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded-md font-bold text-sm border",
                sisaCutiNum > 0
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20",
              )}
            >
              {sisaCutiNum} Hari
            </span>
          </div>
        </div>

        {/* Input Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300 ml-1">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 rounded-xl bg-slate-950/50 border-slate-700 hover:bg-slate-800 hover:text-white",
                    !startDate && "text-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-400" />
                  {startDate
                    ? format(startDate, "PPP", { locale: id })
                    : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-900 border-slate-700 rounded-xl overflow-hidden"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  modifiers={{ holiday: isHolidayOrSunday }}
                  modifiersClassNames={{
                    holiday: "text-red-400 font-bold bg-red-950/30",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-300 ml-1">Tanggal Selesai</Label>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 rounded-xl bg-slate-950/50 border-slate-700 hover:bg-slate-800 hover:text-white",
                    !endDate && "text-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-400" />
                  {endDate
                    ? format(endDate, "PPP", { locale: id })
                    : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-slate-900 border-slate-700 rounded-xl overflow-hidden"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  modifiers={{ holiday: isHolidayOrSunday }}
                  modifiersClassNames={{
                    holiday: "text-red-400 font-bold bg-red-950/30",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Notifikasi Kalkulasi */}
        {startDate && endDate && (
          <div
            className={cn(
              "flex flex-col gap-1.5 p-4 text-sm rounded-xl border transition-colors",
              calculatedDays > 0 && excessDays === 0
                ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-200"
                : calculatedDays <= 0
                  ? "bg-red-950/30 border-red-500/30 text-red-200"
                  : "bg-amber-950/30 border-amber-500/30 text-amber-200",
            )}
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 opacity-70" />
              <span>
                {calculatedDays < 0 ? (
                  "Tanggal selesai tidak valid!"
                ) : calculatedDays === 0 ? (
                  "Durasi 0 hari (Anda hanya memilih hari libur)."
                ) : (
                  <>
                    Estimasi pengajuan:{" "}
                    <b className="font-bold ml-1">
                      {calculatedDays} Hari Kerja
                    </b>
                  </>
                )}
              </span>
            </div>
            {excessDays > 0 && calculatedDays > 0 && (
              <span className="text-xs text-amber-400/90 ml-6 block">
                *Melebihi kuota cuti ({sisaCutiNum} hari). {excessDays} hari
                akan dihitung sebagai Izin Pribadi.
              </span>
            )}
          </div>
        )}

        {/* Input Alasan */}
        <div className="space-y-2">
          <Label className="text-slate-300 ml-1">Alasan Cuti</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan keperluan cuti Anda secara singkat..."
            required
            className="bg-slate-950/50 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px] rounded-xl resize-none focus:border-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 border-t border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
          disabled={loading || calculatedDays <= 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sedang
              Memproses...
            </>
          ) : (
            "Kirim Pengajuan Cuti"
          )}
        </Button>
      </form>

      {/* Alert Over-Quota */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-slate-100 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-500 text-xl">
              <AlertTriangle className="h-6 w-6" /> Sisa Cuti Tidak Mencukupi
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 mt-3 space-y-3 text-sm leading-relaxed">
              <p>
                Anda mengajukan cuti selama{" "}
                <b className="text-white">{calculatedDays} hari</b>, namun sisa
                cuti tahunan Anda hanya{" "}
                <b className="text-white">{sisaCutiNum} hari</b>.
              </p>
              <p className="bg-amber-950/30 p-3 rounded-lg border border-amber-900/50">
                Kelebihan pengajuan sebanyak{" "}
                <b className="text-amber-400">{excessDays} hari</b> akan
                otomatis dialihkan menjadi <b>Izin Pribadi</b> dan dapat
                dikenakan pemotongan sesuai peraturan perusahaan.
              </p>
              <p className="pt-1 font-medium text-slate-200">
                Apakah Anda yakin ingin melanjutkan pengajuan ini?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white rounded-xl"
              onClick={() => setPendingPayload(null)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl border-none shadow-lg shadow-amber-900/20"
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
