import { useState, useMemo } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PegawaiTableProps {
  employees: any[];
  supervisors: any[];
  isLoading: boolean;
  onEdit: (emp: any) => void;
  onDelete: (id: string, name: string) => void;
}

export function PegawaiTable({
  employees,
  supervisors,
  isLoading,
  onEdit,
  onDelete,
}: PegawaiTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredEmployees = useMemo(() => {
    const safeEmployees = Array.isArray(employees) ? employees : [];
    setCurrentPage(1); // Reset halaman setiap kali pencarian berubah
    return safeEmployees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase();
      const empName = (emp.name || emp.fullName || "").toLowerCase();
      const empEmail = (emp.email || "").toLowerCase();
      const empRole = (emp.jabatan || "").toLowerCase();
      return (
        empName.includes(searchLower) ||
        empEmail.includes(searchLower) ||
        empRole.includes(searchLower)
      );
    });
  }, [employees, searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const getSupervisorName = (employee: any) => {
    const supId = employee.supervisorId || employee.supervisor?.id;
    if (!supId) return "-";
    const supervisor = supervisors.find((sup) => sup.id === supId);
    return supervisor ? supervisor.name || supervisor.fullName : "-";
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari nama, email, atau role..."
          className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-gray-800 rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800/50">
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-300">Pegawai</TableHead>
              <TableHead className="text-gray-300">NIY</TableHead>
              <TableHead className="text-gray-300">Divisi</TableHead>
              <TableHead className="text-gray-300">Atasan</TableHead>
              <TableHead className="text-right text-gray-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  Memuat data pegawai...
                </TableCell>
              </TableRow>
            ) : paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm ? "Tidak ditemukan." : "Belum ada data."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((emp) => (
                <TableRow
                  key={emp.id}
                  className="border-gray-800 hover:bg-gray-800/40"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">
                        {emp.name || emp.fullName || "Tanpa Nama"}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" /> {emp.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {emp.niy || "-"}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {emp.divisi?.name || "-"}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {getSupervisorName(emp)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(emp)}
                    >
                      <Pencil className="w-4 h-4 text-amber-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(emp.id, emp.name || emp.fullName)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredEmployees.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-sm text-gray-400">
            Menampilkan{" "}
            <span className="text-white">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            hingga{" "}
            <span className="text-white">
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
            </span>{" "}
            dari <span className="text-white">{filteredEmployees.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-700 bg-gray-800 text-gray-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="text-sm text-gray-300">
              Hal {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-700 bg-gray-800 text-gray-200"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
