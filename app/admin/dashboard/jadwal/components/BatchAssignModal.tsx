import { Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBatchAssign } from "../hooks/useBatchAssign";

export function BatchAssignModal({
  assignLogic,
}: {
  assignLogic: ReturnType<typeof useBatchAssign>;
}) {
  const {
    isOpen,
    setIsOpen,
    selectedShift,
    divisions,
    selectedUserIds,
    searchTerm,
    setSearchTerm,
    divisiFilter,
    setDivisiFilter,
    effectiveDate,
    setEffectiveDate, // State baru dari hook
    currentPage,
    setCurrentPage,
    totalPages,
    filteredEmployees,
    paginatedEmployees,
    handleSave,
    toggleEmployee,
    toggleAll,
  } = assignLogic;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="!w-[60vw] !max-w-[95vw] max-h-[90vh] flex flex-col bg-gray-900 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-white">
            Atur Pegawai untuk: {selectedShift?.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Pilih pegawai yang akan ditugaskan ke template jadwal ini.
          </DialogDescription>
        </DialogHeader>

        {/* INPUT TANGGAL EFEKTIF */}
        <div className="bg-gray-800/50 p-4 border border-gray-700 rounded-lg mt-2 flex flex-col sm:flex-row sm:items-center gap-4">
          <Label className="text-gray-300 min-w-max flex items-center gap-2">
            <Calendar className="w-4 h-4 text-crimson-500" />
            Berlaku Mulai Tanggal:
          </Label>
          <Input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white focus:border-crimson-700 w-full sm:w-auto"
          />
        </div>

        {/* PENCARIAN & FILTER DIVISI */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari Nama, NIY, atau Jabatan..."
              className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={divisiFilter}
            onValueChange={(value) => setDivisiFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-[250px] bg-gray-800 border-gray-700 text-gray-200">
              <SelectValue placeholder="Semua Divisi" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">Semua Divisi</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TABEL PEGAWAI */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4 border border-gray-800 rounded-md">
          <div className="overflow-y-auto flex-1">
            <Table>
              <TableHeader className="bg-gray-800/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={
                        filteredEmployees.length > 0 &&
                        filteredEmployees.every((emp) =>
                          selectedUserIds.includes(emp.id),
                        )
                      }
                      onCheckedChange={(c) =>
                        toggleAll(
                          !!c,
                          filteredEmployees.map((e) => e.id),
                        )
                      }
                    />
                  </TableHead>
                  <TableHead className="text-gray-300">Nama Pegawai</TableHead>
                  <TableHead className="text-gray-300">NIY</TableHead>
                  <TableHead className="text-gray-300">Jabatan</TableHead>
                  <TableHead className="text-gray-300">Divisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      Tidak ada pegawai yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <TableRow
                      key={emp.id}
                      className="cursor-pointer hover:bg-gray-800/50 transition-colors border-gray-800"
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedUserIds.includes(emp.id)}
                          onCheckedChange={() => toggleEmployee(emp.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {emp.name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {emp.niy || "-"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {emp.jabatan || emp.role || "-"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {emp.divisi?.name || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINASI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-800">
              <span className="text-sm text-gray-400">
                Menampilkan {paginatedEmployees.length} dari{" "}
                {filteredEmployees.length} pegawai
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="text-sm font-medium px-2 text-gray-300">
                  Hal {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER & TOMBOL SIMPAN */}
        <DialogFooter className="border-t border-gray-800 pt-4 mt-2 flex flex-row justify-between items-center w-full">
          <span className="text-sm font-medium text-blue-400">
            Total Dipilih: {selectedUserIds.length} Pegawai
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!effectiveDate || selectedUserIds.length === 0}
              className="bg-crimson-700 hover:bg-crimson-800 text-white disabled:opacity-50"
            >
              Simpan Penugasan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
