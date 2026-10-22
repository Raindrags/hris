"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  AlertTriangle,
  Search,
  Edit2,
  Trash2,
  X,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ManageWarningsView() {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const limit = 10;

  // State Modals
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    data: any | null;
  }>({ isOpen: false, data: null });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    data: any | null;
  }>({ isOpen: false, data: null });

  // ✨ PERBAIKAN 1: Tambahkan tipe agar fineAmount bisa menerima string kosong ""
  const [editForm, setEditForm] = useState<{
    fineAmount: number | string;
    description: string;
  }>({
    fineAmount: 0,
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil Data Peringatan dengan Pagination
  const fetchWarnings = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/warnings?page=${page}&limit=${limit}`);
      const json = await res.json();

      // Menyesuaikan dengan format respons NestJS baru yang memiliki properti meta
      if (json.data && json.meta) {
        setWarnings(json.data);
        setTotalPages(json.meta.lastPage || 1);
        setTotalData(json.meta.total || 0);
      } else {
        // Fallback jika backend belum di-update
        const dataList = Array.isArray(json) ? json : json.data || [];
        setWarnings(dataList);
      }
    } catch (error) {
      console.error("Gagal mengambil data peringatan", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings(currentPage);
  }, [currentPage]);

  // Filter Data (Hanya mencari pada data di halaman aktif saat ini)
  const filteredWarnings = warnings.filter(
    (w) =>
      w.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.level?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenEdit = (warning: any) => {
    setEditForm({
      fineAmount: warning.fineAmount !== null ? warning.fineAmount : 50000,
      description: warning.description || "",
    });
    setEditModal({ isOpen: true, data: warning });
  };

  const handleSubmitEdit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/warnings/${editModal.data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Nominal string akan dikonversi ke Number di sini dengan aman saat disubmit
        body: JSON.stringify({
          fineAmount: Number(editForm.fineAmount),
          description: editForm.description,
        }),
      });

      if (res.ok) {
        alert("Data berhasil diperbarui!");
        setEditModal({ isOpen: false, data: null });
        fetchWarnings(currentPage);
      } else {
        alert("Gagal memperbarui data.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus surat peringatan ini?")) return;
    try {
      const res = await fetch(`/api/warnings/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Data berhasil dihapus!");
        // Kembali ke halaman 1 atau refresh data saat ini
        fetchWarnings(currentPage);
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghapus data.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20 text-gray-100">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-500 w-8 h-8" />
          Manajemen Surat Peringatan
        </h1>
        <p className="text-gray-400 mt-1">
          Lihat, edit nominal denda, dan kelola riwayat ST/SP pegawai.
        </p>
      </header>

      <Card className="bg-gray-900 border-gray-800 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 w-full sm:max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 text-gray-400" />
              <Input
                placeholder="Cari di halaman ini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-gray-100 focus:border-amber-500"
              />
            </div>
            <div className="text-sm text-gray-400">
              Menampilkan {filteredWarnings.length} baris (Total: {totalData}{" "}
              Data)
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 animate-spin mx-auto mb-4 text-amber-500" />
              <p>Memuat data peringatan...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Nama Pegawai</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Nominal Denda</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWarnings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          Tidak ada data surat peringatan.
                        </td>
                      </tr>
                    ) : (
                      filteredWarnings.map((warning) => (
                        <tr
                          key={warning.id}
                          className="border-b border-gray-800 hover:bg-gray-800/30"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            {format(
                              new Date(warning.issuedDate),
                              "dd MMM yyyy",
                              { locale: localeID },
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            {warning.user?.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                warning.level.includes("SP")
                                  ? "bg-red-900/50 text-red-400"
                                  : "bg-amber-900/50 text-amber-400"
                              }`}
                            >
                              {warning.level
                                .replace("TEGURAN_", "ST ")
                                .replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">{warning.category}</td>
                          <td className="px-4 py-3 font-bold text-red-400">
                            Rp{" "}
                            {(warning.fineAmount !== null
                              ? warning.fineAmount
                              : 50000
                            ).toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3 flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDetailModal({ isOpen: true, data: warning })
                              }
                              className="text-green-400 hover:text-green-300 hover:bg-green-900/30 h-8 w-8"
                              title="Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(warning)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 h-8 w-8"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(warning.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-8 w-8"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Kontrol Pagination */}
              {totalData > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-400">
                    Halaman{" "}
                    <strong className="text-white">{currentPage}</strong> dari{" "}
                    <strong className="text-white">{totalPages}</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1 || isLoading}
                      className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Sebelumnnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages || isLoading}
                      className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail Peringatan */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="text-green-500 w-5 h-5" />
                Detail Surat Peringatan
              </h3>
              <button
                onClick={() => setDetailModal({ isOpen: false, data: null })}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs">Nama Pegawai</Label>
                  <p className="text-white font-medium">
                    {detailModal.data?.user?.name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">
                    Tanggal Diterbitkan
                  </Label>
                  <p className="text-white font-medium">
                    {detailModal.data?.issuedDate
                      ? format(
                          new Date(detailModal.data.issuedDate),
                          "dd MMM yyyy",
                          { locale: localeID },
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">
                    Level Peringatan
                  </Label>
                  <p className="text-white font-medium mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        detailModal.data?.level?.includes("SP")
                          ? "bg-red-900/50 text-red-400"
                          : "bg-amber-900/50 text-amber-400"
                      }`}
                    >
                      {detailModal.data?.level
                        ?.replace("TEGURAN_", "ST ")
                        .replace("_", " ")}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Kategori</Label>
                  <p className="text-white font-medium">
                    {detailModal.data?.category}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Nominal Denda</Label>
                  <p className="text-red-400 font-bold">
                    Rp{" "}
                    {(detailModal.data?.fineAmount !== null
                      ? detailModal.data?.fineAmount
                      : 50000
                    ).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-400 text-xs">
                  Detail Pelanggaran
                </Label>
                <div className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white text-sm whitespace-pre-wrap">
                  {detailModal.data?.description ||
                    "Tidak ada deskripsi yang ditambahkan."}
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-800 bg-gray-900/50">
              <Button
                onClick={() => setDetailModal({ isOpen: false, data: null })}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Peringatan */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="text-blue-500 w-5 h-5" />
                Edit Peringatan
              </h3>
              <button
                onClick={() => setEditModal({ isOpen: false, data: null })}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-gray-800/50 p-3 rounded-md border border-gray-800">
                <p className="text-sm text-gray-400">
                  Pegawai:{" "}
                  <strong className="text-white">
                    {editModal.data?.user?.name}
                  </strong>
                </p>
                <p className="text-sm text-gray-400">
                  Level:{" "}
                  <strong className="text-white">
                    {editModal.data?.level
                      ?.replace("TEGURAN_", "ST ")
                      .replace("_", " ")}
                  </strong>
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Ubah Nominal Denda (Rp)</Label>
                <Input
                  type="number"
                  min="0"
                  className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 text-lg font-bold"
                  value={editForm.fineAmount}
                  // ✨ PERBAIKAN 2: Izinkan string agar angka tidak memantul ke 0 saat kosong
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      fineAmount: e.target.value === "" ? "" : e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Detail Pelanggaran</Label>
                <textarea
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-800 bg-gray-900/50">
              <Button
                variant="ghost"
                onClick={() => setEditModal({ isOpen: false, data: null })}
                className="text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
