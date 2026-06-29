import { Users, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShiftTemplate } from "../types";
import { DAYS } from "../constants";

interface Props {
  shifts: ShiftTemplate[];
  totalShifts: number;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (shift: ShiftTemplate) => void;
  onDelete: (id: string) => void;
  onAssign: (shift: ShiftTemplate) => void;
}

export function ShiftTable({
  shifts, totalShifts, isLoading, currentPage, totalPages,
  onPageChange, onEdit, onDelete, onAssign
}: Props) {
  return (
    <div className="border border-gray-800 rounded-md">
      <Table>
        <TableHeader className="bg-gray-800/50">
          <TableRow>
            <TableHead className="text-gray-300">Nama Template</TableHead>
            <TableHead className="text-gray-300">Hari Kerja (Aktif)</TableHead>
            <TableHead className="text-gray-300">Tipe</TableHead>
            <TableHead className="text-right text-gray-300">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && shifts.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center py-6 text-gray-500">Memuat data...</TableCell></TableRow>
          ) : shifts.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center py-6 text-gray-500">Belum ada template jadwal.</TableCell></TableRow>
          ) : (
            shifts.map((s) => {
              const activeDays = s.details
                ?.map((d) => {
                  const dayObj = DAYS.find((day) => day.id === d.dayOfWeek);
                  return dayObj ? dayObj.name.substring(0, 3) : "";
                })
                .join(", ");

              return (
                <TableRow key={s.id} className="border-gray-800">
                  <TableCell className="font-medium text-white">{s.name}</TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {s.details?.length || 0} Hari ({activeDays || "-"})
                  </TableCell>
                  <TableCell>
                    {s.isFlexible ? (
                      <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full font-medium">Flexible</span>
                    ) : (
                      <span className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded-full font-medium">Reguler</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="border-blue-800 bg-blue-900/20 text-blue-300 hover:bg-blue-900/40 mr-2" onClick={() => onAssign(s)}>
                      <Users className="w-4 h-4 mr-2" /> Assign Pegawai
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(s)}>
                      <Pencil className="w-4 h-4 text-amber-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(s.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border-t border-gray-800">
          <span className="text-sm text-gray-400">Menampilkan {shifts.length} dari {totalShifts} template</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50">
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <span className="text-sm font-medium px-2 text-gray-300">Hal {currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}