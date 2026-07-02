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
import { Lock, CheckCircle2, Loader2, Edit, Trash2 } from "lucide-react"; // ✨ Tambah icon Edit & Trash2
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AttendancePeriod, PeriodActionType } from "../types";

interface PeriodTableProps {
  periods: AttendancePeriod[];
  loading: boolean;
  onActionTrigger: (id: string, type: PeriodActionType) => void;
  onEdit: (period: AttendancePeriod) => void; // ✨ Tambah prop onEdit
  onDelete: (id: string) => void;             // ✨ Tambah prop onDelete
}

export function PeriodTable({ 
  periods, 
  loading, 
  onActionTrigger, 
  onEdit,     // ✨ Destructure onEdit
  onDelete    // ✨ Destructure onDelete
}: PeriodTableProps) {
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
                    
                    {/* ✨ TOMBOL EDIT: Muncul jika periode belum dikunci */}
                    {!period.isClosed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(period)}
                        className="border-blue-600/50 hover:bg-blue-600 hover:text-white text-blue-400 bg-transparent btn-sm px-2"
                        title="Edit Periode"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    {/* ✨ TOMBOL HAPUS: Muncul jika periode belum dikunci dan belum aktif */}
                    {!period.isClosed && !period.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(period.id)}
                        className="border-rose-600/50 hover:bg-rose-600 hover:text-white text-rose-400 bg-transparent btn-sm px-2"
                        title="Hapus Periode"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    {/* TOMBOL AKTIFKAN */}
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

                    {/* TOMBOL KUNCI */}
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

                    {/* STATUS TERKUNCI (NO ACTION) */}
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