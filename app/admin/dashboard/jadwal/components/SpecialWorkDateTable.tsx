import { Users, Pencil, Trash2, Clock, Calendar, CalendarX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SpecialWorkDate } from "../types";

interface Props {
  data: SpecialWorkDate[];
  isLoading: boolean;
  onEdit: (data: SpecialWorkDate) => void;
  onDelete: (id: string) => void;
  onAssign: (data: SpecialWorkDate) => void;
}

export function SpecialWorkDateTable({ data, isLoading, onEdit, onDelete, onAssign }: Props) {
  return (
    <div className="border border-gray-800 rounded-md overflow-hidden bg-gray-900/30">
      <Table>
        <TableHeader className="bg-gray-800/80">
          <TableRow className="border-gray-700 hover:bg-transparent">
            <TableHead className="text-gray-300 font-semibold">Keterangan Kegiatan</TableHead>
            <TableHead className="text-gray-300 font-semibold">Periode Tanggal</TableHead>
            <TableHead className="text-gray-300 font-semibold">Jam Operasional</TableHead>
            <TableHead className="text-gray-300 font-semibold">Cakupan Pegawai</TableHead>
            <TableHead className="text-right text-gray-300 font-semibold">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Memuat data jadwal...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                  <CalendarX className="w-10 h-10 text-gray-600" />
                  <p className="text-sm">Belum ada agenda hari kerja khusus.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="border-gray-800 hover:bg-gray-800/40 transition-colors">
                {/* 1. KETERANGAN */}
                <TableCell className="font-medium text-gray-100">
                  {item.name}
                </TableCell>

                {/* 2. PERIODE TANGGAL (Penyatuan Kolom) */}
                <TableCell className="text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {item.startDate === item.endDate ? (
                      <span>{item.startDate}</span>
                    ) : (
                      <span>{item.startDate} <span className="text-gray-500 mx-1">s/d</span> {item.endDate}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {!item.startTime && !item.endTime ? (
                    <span className="text-xs text-gray-400 italic bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50">
                      Ikut Jam Reguler
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-400 font-medium bg-amber-900/10 w-fit px-2 py-1 rounded border border-amber-900/30">
                      <Clock className="w-3.5 h-3.5 text-amber-500/70" />
                      {item.startTime || "00:00"} - {item.endTime || "00:00"}
                    </div>
                  )}
                </TableCell>

                {/* 4. TOTAL PEGAWAI (Logika 0 = Semua Pegawai) */}
                <TableCell>
                  {!item.totalEmployees || item.totalEmployees === 0 ? (
                    <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800/50 font-medium">
                      Semua Pegawai
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700">
                      {item.totalEmployees} Spesifik
                    </span>
                  )}
                </TableCell>

                {/* 5. AKSI */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-800 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/50 transition-colors h-8 text-xs" 
                      onClick={() => onAssign(item)}
                    >
                      <Users className="w-3.5 h-3.5 mr-1.5" /> Assign
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-gray-700 hover:text-amber-300 transition-colors text-amber-500/70" 
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-red-900/30 hover:text-red-400 transition-colors text-red-500/70" 
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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