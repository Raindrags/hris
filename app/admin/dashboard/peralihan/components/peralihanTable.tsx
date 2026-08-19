import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PeralihanAtasan } from "../types";

interface Props {
  data: PeralihanAtasan[];
  isLoading: boolean;
  onEdit: (record: PeralihanAtasan) => void;
  onDelete: (id: string) => void;
}

export function PeralihanAtasanTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  // Logic untuk mengecek apakah peralihan masih berlaku
  const checkIsActive = (tanggalBerakhir: string) => {
    if (!tanggalBerakhir) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam agar akurat
    const endDate = new Date(tanggalBerakhir);
    return endDate >= today;
  };

  // Fungsi helper untuk memformat tanggal (YYYY-MM-DD ke format lokal)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="border border-gray-800 rounded-md">
      <Table>
        <TableHeader className="bg-gray-800/50">
          <TableRow>
            <TableHead className="text-gray-300">Atasan Lama</TableHead>
            <TableHead className="text-gray-300">Dialihkan Ke</TableHead>
            <TableHead className="text-gray-300">Masa Berlaku</TableHead>
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-right text-gray-300">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                Memuat data dari server...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                Belum ada riwayat peralihan atasan.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const isActive = checkIsActive(item.tanggalBerakhir);

              return (
                <TableRow key={item.id} className="border-gray-800">
                  <TableCell className="font-medium text-white">
                    {/* Mengambil nama dari nested object backend */}
                    {item.atasanLama?.name || item.atasanLamaName || "-"}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {/* Mengambil nama dari nested object backend */}
                    {item.atasanBaru?.name || item.atasanBaruName || "-"}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {formatDate(item.tanggalMulai)} s/d{" "}
                    <span
                      className={
                        !isActive
                          ? "text-red-400 line-through opacity-70"
                          : "text-gray-200 font-medium"
                      }
                    >
                      {formatDate(item.tanggalBerakhir)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isActive ? (
                      <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded-full font-medium">
                        Dialihkan (Aktif)
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full font-medium">
                        Kembali ke Semula
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      title="Edit Peralihan"
                    >
                      <Pencil className="w-4 h-4 text-amber-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
