"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Komponen Input ditambahkan
import {
  Clock,
  Filter,
  Eye,
  Calculator,
  Loader2,
  Ban,
  ChevronLeft,
  ChevronRight,
  Search, // Icon Search ditambahkan
} from "lucide-react";
import { DeductionModal } from "@/app/components/dashboard/deductions-modal";

export function LeaveHistoryTable({
  leaveHistory,
  divisions,
  isSuperAdmin = true,
}: any) {
  const router = useRouter();

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>(""); // State untuk pencarian
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // State untuk Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  // State Loading untuk aksi di komponen ini (pembatalan)
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);

  // Logika Filter (Divisi + Pencarian Nama) & Pagination
  const filteredHistory = leaveHistory.filter((req: any) => {
    // Cek filter divisi
    const matchDivision =
      selectedDivisionId === "ALL" ||
      req.user.divisi?.id === selectedDivisionId;

    // Cek filter nama
    const matchName = req.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchDivision && matchName;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Handlers
  const handleDivisionChange = (v: string) => {
    setSelectedDivisionId(v);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenDetail = (req: any) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeduction = (req: any) => {
    setSelectedRequest(req);
    setIsDeductionModalOpen(true);
  };

  const handleOpenDiscard = (req: any) => {
    setSelectedRequest(req);
    setIsDiscardModalOpen(true);
  };

  // Logika Pembatalan Pengajuan
  const handleDiscard = async () => {
    setIsDiscarding(true);
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}/discard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal membatalkan pengajuan");
      }

      toast.success("Pengajuan berhasil dibatalkan");
      setIsDiscardModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan pada server");
    } finally {
      setIsDiscarding(false);
    }
  };

  return (
    <>
      {/* TABEL UTAMA */}
      <Card className="border-gray-800 bg-gray-900 shadow-md col-span-full">
        <CardHeader className="border-b border-gray-800 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-crimson-500" /> Histori Pengajuan
              </CardTitle>
              <CardDescription className="text-gray-400">
                Riwayat aktivitas pengajuan izin pegawai.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Kolom Pencarian Nama */}
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari nama pegawai..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 bg-gray-800 border-gray-700 text-gray-200 focus-visible:ring-gray-700"
                />
              </div>

              {/* Filter Divisi (Hanya Tampil Jika isSuperAdmin == true) */}
              {isSuperAdmin && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                  <Select
                    value={selectedDivisionId}
                    onValueChange={(v) => handleDivisionChange(v ?? "ALL")}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] bg-gray-800 border-gray-700 text-gray-200">
                      <SelectValue placeholder="Semua Divisi" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      <SelectItem value="ALL">Semua Divisi</SelectItem>
                      {divisions.map((div: any) => (
                        <SelectItem key={div.id} value={div.id}>
                          {div.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col min-h-[400px] justify-between">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-800/50">
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-300">Pegawai</TableHead>
                  <TableHead className="text-gray-300">Divisi</TableHead>
                  <TableHead className="text-gray-300">Tanggal</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300 text-center">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.length > 0 ? (
                  paginatedHistory.map((req: any) => (
                    <TableRow key={req.id} className="border-b border-gray-800">
                      <TableCell className="font-medium text-white">
                        {req.user.name}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {req.user.divisi?.name || "-"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(req.startDate).toLocaleDateString("id-ID")} -{" "}
                        {new Date(req.endDate).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            req.status === "APPROVED"
                              ? "bg-emerald-950 text-emerald-400 hover:bg-emerald-950"
                              : req.status === "REJECTED"
                                ? "bg-red-950 text-red-400 hover:bg-red-950"
                                : req.status === "CANCELLED"
                                  ? "bg-gray-800 text-gray-400 hover:bg-gray-800"
                                  : "bg-yellow-950 text-yellow-400 hover:bg-yellow-950"
                          }
                        >
                          {req.status === "APPROVED"
                            ? "Disetujui"
                            : req.status === "REJECTED"
                              ? "Ditolak"
                              : req.status === "CANCELLED"
                                ? "Dibatalkan"
                                : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(req)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>

                          {/* Tombol Atur Denda (Kecuali Cuti yang tidak dipotong) */}
                          {!(
                            req.type === "CUTI" &&
                            req.deductionOptions !== "DIPOTONG"
                          ) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeduction(req)}
                              className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                            >
                              <Calculator className="h-4 w-4 mr-1" />
                              Atur Denda
                            </Button>
                          )}

                          {/* Tombol Batalkan (Kecuali yang sudah ditolak/dibatalkan) */}
                          {req.status !== "REJECTED" &&
                            req.status !== "CANCELLED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDiscard(req)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Batalkan
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      {searchQuery
                        ? "Pencarian tidak menemukan hasil."
                        : "Tidak ada data pengajuan yang ditemukan."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-800 gap-4">
              <div className="text-sm text-gray-400">
                Menampilkan{" "}
                <span className="font-medium text-white">{startIndex + 1}</span>{" "}
                -{" "}
                <span className="font-medium text-white">
                  {Math.min(endIndex, filteredHistory.length)}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-white">
                  {filteredHistory.length}
                </span>{" "}
                data
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <div className="text-sm text-gray-400 font-medium px-2">
                  Halaman {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DETAIL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Detail Pengajuan</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-800 pb-3">
                <span className="text-gray-400">Nama</span>
                <span className="col-span-2 font-medium text-white">
                  : {selectedRequest.user.name}
                </span>

                <span className="text-gray-400">Tipe / Kategori</span>
                <span className="col-span-2 font-medium text-white">
                  : {selectedRequest.type === "CUTI" ? "Cuti Tahunan" : "Izin"}
                  {selectedRequest.category
                    ? ` (${selectedRequest.category})`
                    : ""}
                </span>

                <span className="text-gray-400">Tanggal</span>
                <span className="col-span-2 font-medium text-white">
                  :{" "}
                  {new Date(selectedRequest.startDate).toLocaleDateString(
                    "id-ID",
                  )}{" "}
                  s/d{" "}
                  {new Date(selectedRequest.endDate).toLocaleDateString(
                    "id-ID",
                  )}
                </span>
                {selectedRequest.time && (
                  <>
                    <span className="text-gray-400">
                      {selectedRequest.category === "Terlambat"
                        ? "Estimasi Hadir"
                        : selectedRequest.category === "PulangAwal"
                          ? "Jam Pulang"
                          : selectedRequest.category === "IzinKeluar"
                            ? "Waktu Izin"
                            : "Jam"}
                    </span>
                    <span className="col-span-2 font-medium text-white">
                      : {selectedRequest.time}
                      {selectedRequest.category === "IzinKeluar" &&
                      selectedRequest.returnTime
                        ? ` s/d ${selectedRequest.returnTime}`
                        : ""}
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-gray-400">
                  Alasan:
                </span>
                <p className="bg-gray-950 p-3 rounded-md text-sm border border-gray-800">
                  {selectedRequest.reason || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-gray-800">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    Status Pemotongan
                  </span>
                  <div>
                    {selectedRequest.deductionOptions === "DIPOTONG" ? (
                      <Badge className="bg-red-950 text-red-400">
                        Dikenakan Potongan
                      </Badge>
                    ) : selectedRequest.deductionOptions ===
                      "TIDAK_DIPOTONG" ? (
                      <Badge className="bg-emerald-950 text-emerald-400">
                        Tidak Dipotong
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Belum diputuskan
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    Penyerahan Tugas
                  </span>
                  <div className="text-sm">
                    {selectedRequest.taskDetail ? (
                      <p className="text-gray-300 break-words">
                        {selectedRequest.taskDetail}
                      </p>
                    ) : (
                      <span className="text-gray-500 italic">
                        Tidak ada delegasi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeductionModal
        isOpen={isDeductionModalOpen}
        onClose={() => setIsDeductionModalOpen(false)}
        request={selectedRequest}
        onSuccess={() => router.refresh()}
      />

      {/* MODAL DISCARD (Pembatalan) */}
      <Dialog open={isDiscardModalOpen} onOpenChange={setIsDiscardModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" /> Konfirmasi Pembatalan
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Apakah Anda yakin ingin membatalkan pengajuan ini secara paksa?
              Tindakan ini tidak dapat diurungkan.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="bg-gray-950 p-4 rounded-md border border-gray-800 text-sm space-y-2">
              <p>
                <span className="text-gray-500">Pegawai:</span>{" "}
                <span className="text-white">{selectedRequest.user.name}</span>
              </p>
              <p>
                <span className="text-gray-500">Tipe:</span>{" "}
                <span className="text-white">{selectedRequest.type}</span>
              </p>
              <p>
                <span className="text-gray-500">Status Saat Ini:</span>{" "}
                <span className="text-white">{selectedRequest.status}</span>
              </p>
            </div>
          )}

          <DialogFooter className="mt-4 flex gap-2 justify-end sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDiscardModalOpen(false)}
              className="text-gray-400 hover:text-white"
              disabled={isDiscarding}
            >
              Kembali
            </Button>
            <Button
              type="button"
              onClick={handleDiscard}
              className="bg-red-700 hover:bg-red-800 text-white"
              disabled={isDiscarding}
            >
              {isDiscarding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ya, Batalkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
