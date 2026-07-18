import { Users, Pencil, Trash2, Calendar, CalendarX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Gunakan any sementara di tipe data sampai backend diubah
interface Props {
  data: any[];
  isLoading: boolean;
  onEdit: (data: any) => void;
  onDelete: (id: string) => void;
  onAssign: (data: any) => void;
}

export function HolidayTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onAssign,
}: Props) {
  return (
    <div className="border border-gray-800 rounded-md overflow-hidden bg-gray-900/30">
      <Table>
        <TableHeader className="bg-gray-800/80">
          <TableRow className="border-gray-700 hover:bg-transparent">
            <TableHead className="text-gray-300 font-semibold">
              Deskripsi Hari Libur
            </TableHead>
            <TableHead className="text-gray-300 font-semibold">
              Periode Tanggal
            </TableHead>
            <TableHead className="text-gray-300 font-semibold">
              Cakupan Pegawai
            </TableHead>
            <TableHead className="text-right text-gray-300 font-semibold">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Memuat data libur...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                  <CalendarX className="w-10 h-10 text-gray-600" />
                  <p className="text-sm">Belum ada pengaturan hari libur.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <TableCell className="font-medium text-gray-100">
                  {item.description}
                </TableCell>

                {/* PERIODE TANGGAL */}
                <TableCell className="text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {/* Jika DB masih pakai format lama (date), kita siapkan fallback */}
                    {item.startDate === item.endDate || !item.endDate ? (
                      <span>{item.startDate || item.date}</span>
                    ) : (
                      <span>
                        {item.startDate}{" "}
                        <span className="text-gray-500 mx-1">s/d</span>{" "}
                        {item.endDate}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {!item.users || item.users.length === 0 ? (
                    <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800/50 font-medium">
                      Semua Pegawai
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700">
                      {item.users.length} Spesifik
                    </span>
                  )}
                </TableCell>
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
