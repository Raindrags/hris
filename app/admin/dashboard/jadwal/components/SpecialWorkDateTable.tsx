// app/admin/pengaturan-jadwal/components/SpecialWorkDateTable.tsx

import { Users, Pencil, Trash2, Clock } from "lucide-react";
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
    <div className="border border-gray-800 rounded-md">
      <Table>
        <TableHeader className="bg-gray-800/50">
          <TableRow>
            <TableHead className="text-gray-300">Keterangan</TableHead>
            <TableHead className="text-gray-300">Tanggal Mulai</TableHead>
            <TableHead className="text-gray-300">Tanggal Selesai</TableHead>
            <TableHead className="text-gray-300">Jam Kerja</TableHead> {/* KOLOM BARU */}
            <TableHead className="text-gray-300">Total Pegawai</TableHead>
            <TableHead className="text-right text-gray-300">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && data.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-500">Memuat data...</TableCell></TableRow>
          ) : data.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-500">Belum ada agenda khusus.</TableCell></TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="border-gray-800">
                <TableCell className="font-medium text-white">{item.name}</TableCell>
                <TableCell className="text-sm text-gray-400">{item.startDate}</TableCell>
                <TableCell className="text-sm text-gray-400">{item.endDate}</TableCell>
                {/* DISKPLAY JAM KERJA BARU */}
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {item.startTime || "--:--"} - {item.endTime || "--:--"}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700">
                    {item.totalEmployees || 0} Terpilih
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" className="border-emerald-800 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/40" onClick={() => onAssign(item)}>
                    <Users className="w-4 h-4 mr-2" /> Assign
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="w-4 h-4 text-amber-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}