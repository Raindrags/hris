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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Filter, Eye, Calculator, Loader2, Ban } from "lucide-react";

export function LeaveHistoryTable({ leaveHistory, divisions }: any) {
  const router = useRouter();

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // State untuk Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  // State form
  const [noDeduction, setNoDeduction] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);

  const filteredHistory =
    selectedDivisionId === "ALL"
      ? leaveHistory
      : leaveHistory.filter(
          (req: any) => req.user.divisi?.id === selectedDivisionId,
        );

  const handleOpenDetail = (req: any) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeduction = (req: any) => {
    setSelectedRequest(req);
    setNoDeduction(req.deductionOptions === "TIDAK_DIPOTONG");
    setIsDeductionModalOpen(true);
  };

  const handleOpenDiscard = (req: any) => {
    setSelectedRequest(req);
    setIsDiscardModalOpen(true);
  };

  const handleSubmitDeduction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch(
        `/api/requests/${selectedRequest.id}/deductions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ noDeduction, ...payload }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyimpan data denda");
      }

      toast.success("Denda dan potongan berhasil diperbarui");
      setIsDeductionModalOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Terjadi kesalahan pada server");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Card className="border-gray-800 bg-gray-900 shadow-md col-span-full">
        <CardHeader className="border-b border-gray-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-crimson-500" /> Histori Pengajuan
              </CardTitle>
              <CardDescription className="text-gray-400">
                Riwayat aktivitas pengajuan izin pegawai.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
              <Select
                value={selectedDivisionId}
                onValueChange={(v) => setSelectedDivisionId(v ?? "ALL")}
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              {filteredHistory.map((req: any) => (
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
                          ? "bg-emerald-950 text-emerald-400"
                          : req.status === "REJECTED"
                            ? "bg-red-950 text-red-400"
                            : req.status === "CANCELLED"
                              ? "bg-gray-800 text-gray-400"
                              : "bg-yellow-950 text-yellow-400"
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

                      {/* Logika untuk menyembunyikan tombol denda jika Cuti & Tidak Dipotong */}
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

                      {/* Tombol Batal hanya muncul jika pengajuan belum Dibatalkan/Ditolak */}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 1. Modal Detail Pengajuan */}
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

      {/* 2. Modal Form Denda & Potongan */}
      <Dialog
        open={isDeductionModalOpen}
        onOpenChange={setIsDeductionModalOpen}
      >
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Atur Denda & Potongan
            </DialogTitle>
            <CardDescription className="text-gray-400">
              {selectedRequest?.user?.name} -{" "}
              {selectedRequest?.category || selectedRequest?.type}
            </CardDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitDeduction}
            className="space-y-4 max-h-[65vh] overflow-y-auto px-1 mt-2"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="no_deduction"
                checked={noDeduction}
                onCheckedChange={(c) => setNoDeduction(c as boolean)}
              />
              <Label
                htmlFor="no_deduction"
                className="font-semibold text-emerald-400 cursor-pointer"
              >
                Tidak Dikenakan Pemotongan
              </Label>
            </div>

            {!noDeduction && (
              <div className="pl-4 space-y-4 border-l-2 border-gray-800">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-gray-400">
                    Jenis Potongan
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="p_gaji"
                      name="potongGaji"
                      defaultChecked={selectedRequest?.potongGaji}
                    />
                    <label
                      htmlFor="p_gaji"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Potong Gaji
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="p_konsum"
                      name="potongKonsumsi"
                      defaultChecked={selectedRequest?.potongKonsumsi}
                    />
                    <label
                      htmlFor="p_konsum"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Tunjangan Konsumsi
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="p_trans"
                      name="potongTransport"
                      defaultChecked={selectedRequest?.potongTransport}
                    />
                    <label
                      htmlFor="p_trans"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Tunjangan Transportasi
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-gray-400">
                    Denda Telat
                  </Label>
                  <RadioGroup
                    defaultValue={selectedRequest?.lateFine?.toString() || "0"}
                    name="lateFine"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="t_0" />
                      <Label
                        htmlFor="t_0"
                        className="text-gray-300 cursor-pointer"
                      >
                        Tidak ada
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5000" id="t_5000" />
                      <Label
                        htmlFor="t_5000"
                        className="text-gray-300 cursor-pointer"
                      >
                        Rp 5.000
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10000" id="t_10000" />
                      <Label
                        htmlFor="t_10000"
                        className="text-gray-300 cursor-pointer"
                      >
                        Rp 10.000
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">
                      Jumlah Inval
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        name="invalCount"
                        className="w-16 bg-gray-950 border-gray-700 text-gray-200 focus-visible:ring-gray-700"
                        defaultValue={selectedRequest?.invalCount || 0}
                        min={0}
                      />
                      <span className="text-xs text-gray-500">x Rp 5.000</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">
                      Jumlah Shift
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        name="shiftCount"
                        className="w-16 bg-gray-950 border-gray-700 text-gray-200 focus-visible:ring-gray-700"
                        defaultValue={selectedRequest?.shiftCount || 0}
                        min={0}
                      />
                      <span className="text-xs text-gray-500">
                        x Rp {selectedRequest?.shiftRate || 30000}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDeductionModalOpen(false)}
                className="text-gray-400 hover:text-white"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-orange-700 hover:bg-orange-800 text-white min-w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Denda"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Modal Konfirmasi Pembatalan (Baru) */}
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
