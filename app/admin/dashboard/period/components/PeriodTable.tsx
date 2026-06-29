"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AttendancePeriod, PeriodActionType } from "../types";

interface PeriodTableProps {
  periods: AttendancePeriod[];
  loading: boolean;
  onActionTrigger: (id: string, type: PeriodActionType) => void;
}

export function PeriodTable({ periods, loading, onActionTrigger }: PeriodTableProps) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/40">
      <Table>
        <TableHeader className="bg-slate-900">
          <TableRow className="border-slate-800">
            <TableHead className="text-slate-400 font-semibold">Nama Periode</TableHead>
            <TableHead className="text-slate-400 font-semibold">Tanggal Mulai</TableHead>
            <TableHead className="text-slate-400 font-semibold">Tanggal Selesai</TableHead>
            <TableHead className="text-slate-400 font-semibold">Status Dashboard</TableHead>
            <TableHead className="text-slate-400 font-semibold">Status Kunci</TableHead>
            <TableHead className="text-slate-400 font-semibold text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Memuat data periode...
              </TableCell>
            </TableRow>
          ) : periods.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                Belum ada periode absensi yang terdaftar.
              </TableCell>
            </TableRow>
          ) : (
            periods.map((period) => (
              <TableRow key={period.id} className="border-slate-800 hover:bg-slate-800/30">
                <TableCell className="font-medium text-slate-200">{period.name}</TableCell>
                <TableCell>{format(new Date(period.startDate), "dd MMMM yyyy", { locale: localeId })}</TableCell>
                <TableCell>{format(new Date(period.endDate), "dd MMMM yyyy", { locale: localeId })}</TableCell>
                <TableCell>
                  {period.isActive ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0.5">
                      Aktif Berjalan
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-800 px-2 py-0.5">
                      Nonaktif
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {period.isClosed ? (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-0.5">
                      Terkunci (Selesai)
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5">
                      Terbuka
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!period.isActive && !period.isClosed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onActionTrigger(period.id, "active")}
                        className="border-green-600/50 hover:bg-green-600 hover:text-white text-green-400 bg-transparent btn-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aktifkan
                      </Button>
                    )}
                    {!period.isClosed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onActionTrigger(period.id, "close")}
                        className="border-red-600/50 hover:bg-red-600 hover:text-white text-red-400 bg-transparent btn-sm"
                      >
                        <Lock className="h-3.5 w-3.5 mr-1" /> Kunci
                      </Button>
                    )}
                    {period.isClosed && (
                      <span className="text-xs text-slate-500 italic pr-2">No Action</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}