"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { PeriodActionType } from "../types";

interface PeriodAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
 type: PeriodActionType | "delete" | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PeriodAlertDialog({ open, onOpenChange, type, onConfirm, onCancel }: PeriodAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" /> Apakah Anda Yakin?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 mt-2">
            {type === "active" ? (
              <>Mengaktifkan periode ini akan otomatis menonaktifkan periode aktif yang lain. Dashboard pegawai akan langsung merujuk pada rentang tanggal cutoff periode ini.</>
            ) : (
              <>Mengunci periode bersifat <b>permanen</b>. Pegawai tidak akan bisa lagi mengajukan izin pada rentang tanggal di periode ini karena data siap ditarik untuk penggajian (payroll).</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200" onClick={onCancel}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={type === "close" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
          >
            Ya, Lanjutkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}