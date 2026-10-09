"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Users,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/app/carfleet/context/DashboardContext";
import AdminBookingDetailModal from "../modals/AdminBookingDetailModal";

type ActionType =
  | "approve"
  | "reject"
  | "approveNebeng"
  | "rejectNebeng"
  | "none";

export default function PersetujuanPage() {
  const {
    persetujuan,
    kendaraan,
    approveBooking,
    rejectBooking,
    fetchBookingDetail,
    persetujuanNebeng,
    approveRideShare,
    rejectRideShare,
  } = useDashboard();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ==========================================
  // ✨ STATE UNTUK MODAL KONFIRMASI & NOTIFIKASI
  // ==========================================
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: ActionType;
    targetId: string;
  }>({ isOpen: false, type: "none", targetId: "" });

  const [rejectReason, setRejectReason] = useState("");

  const [notif, setNotif] = useState<{
    isOpen: boolean;
    status: "success" | "error";
    message: string;
  }>({ isOpen: false, status: "success", message: "" });

  // ==========================================
  // HANDLER PEMBUKA MODAL
  // ==========================================
  const handleOpenDetail = async (id: string) => {
    await fetchBookingDetail(id);
    setIsDetailModalOpen(true);
  };

  const handleApproveClick = (id: string) => {
    setActionModal({ isOpen: true, type: "approve", targetId: id });
  };

  const handleRejectClick = (id: string) => {
    setRejectReason("");
    setActionModal({ isOpen: true, type: "reject", targetId: id });
  };

  const handleApproveNebengClick = (id: string) => {
    setActionModal({ isOpen: true, type: "approveNebeng", targetId: id });
  };

  const handleRejectNebengClick = (id: string) => {
    setRejectReason("");
    setActionModal({ isOpen: true, type: "rejectNebeng", targetId: id });
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: "none", targetId: "" });
    setRejectReason("");
  };

  const showNotif = (status: "success" | "error", message: string) => {
    setNotif({ isOpen: true, status, message });
    if (status === "success") {
      setTimeout(() => setNotif((prev) => ({ ...prev, isOpen: false })), 2500);
    }
  };

  // ==========================================
  // EKSEKUSI FUNGSI (SUBMIT ACTION)
  // ==========================================
  const submitAction = async () => {
    const { type, targetId } = actionModal;
    if (!targetId) return;

    setLoadingId(targetId);
    try {
      if (type === "approve") {
        const targetBooking = persetujuan.find((b: any) => b.id === targetId);

        const existingVehicleId = targetBooking?.vehicle?.id || "";

        await approveBooking(targetId, existingVehicleId);
        showNotif("success", "Peminjaman berhasil disetujui!");
      } else if (type === "reject") {
        await rejectBooking(targetId, rejectReason);
        showNotif("success", "Peminjaman berhasil ditolak!");
      } else if (type === "approveNebeng") {
        await approveRideShare(targetId);
        showNotif("success", "Permohonan nebeng berhasil disetujui!");
      } else if (type === "rejectNebeng") {
        await rejectRideShare(targetId, rejectReason);
        showNotif("success", "Permohonan nebeng berhasil ditolak!");
      }
    } catch (error: any) {
      showNotif("error", error.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoadingId(null);
      closeActionModal();
    }
  };

  return (
    <div className="p-6 space-y-10 relative">
      {/* --- SEKSI 1: ANTREAN ARMADA UTAMA --- */}
      <section>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5 text-amber-500" /> Antrean Peminjaman Armada
        </h1>
        {persetujuan.length === 0 ? (
          <div className="bg-slate-50 p-6 text-center text-slate-500 rounded-lg border border-dashed text-sm">
            Tidak ada antrean persetujuan armada.
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="p-4 font-semibold">Peminjam Utama</th>
                  <th className="p-4 font-semibold">Tujuan & Penumpang</th>
                  <th className="p-4 font-semibold">Jadwal Pakai</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {persetujuan.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <strong className="block text-slate-900">
                        {item.user?.name || "User"}
                      </strong>
                      <span className="text-xs text-slate-500">
                        ID: {item.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium text-slate-900">
                        {item.destination}
                      </span>
                      <Badge variant="outline" className="mt-1 text-slate-900">
                        {item.passengers} Orang
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium text-slate-900">
                        {new Date(item.date).toLocaleDateString("id-ID")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.timeOut} - {item.timeIn}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(item.id)}
                          className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 text-xs disabled:opacity-50"
                        >
                          <Info size={14} /> Detail
                        </button>
                        <button
                          onClick={() => handleApproveClick(item.id)}
                          disabled={loadingId === item.id}
                          className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 text-xs disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle size={14} /> Setuju
                        </button>
                        <button
                          onClick={() => handleRejectClick(item.id)}
                          disabled={loadingId === item.id}
                          className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-200 text-xs disabled:opacity-50 transition-colors"
                        >
                          <XCircle size={14} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- SEKSI 2: ANTREAN NEBENG --- */}
      <section>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Users className="w-5 h-5 text-indigo-500" /> Antrean Join Ride
          (Nebeng)
        </h1>
        {persetujuanNebeng?.length === 0 || !persetujuanNebeng ? (
          <div className="bg-slate-50 p-6 text-center text-slate-500 rounded-lg border border-dashed text-sm">
            Tidak ada permohonan nebeng saat ini.
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="p-4 font-semibold">Pemohon Nebeng</th>
                  <th className="p-4 font-semibold">Nebeng di Perjalanan</th>
                  <th className="p-4 font-semibold">Detail Nebeng</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {persetujuanNebeng.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <strong className="block text-slate-900">
                        {item.user?.name}
                      </strong>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium text-slate-900">
                        {item.booking?.destination}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.booking?.date
                          ? new Date(item.booking.date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </span>
                      {item.booking?.vehicle && (
                        <Badge
                          variant="outline"
                          className="mt-1 block w-fit text-slate-900"
                        >
                          Mobil: {item.booking.vehicle.platNumber}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="block text-slate-900">
                        {item.seats} Kursi
                      </span>
                      <span className="text-xs text-slate-500">
                        Turun di: {item.dropOff}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApproveNebengClick(item.id)}
                          disabled={loadingId === item.id}
                          className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 text-xs transition-colors"
                        >
                          <CheckCircle size={14} /> Setuju
                        </button>
                        <button
                          onClick={() => handleRejectNebengClick(item.id)}
                          disabled={loadingId === item.id}
                          className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-200 text-xs transition-colors"
                        >
                          <XCircle size={14} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* ✨ MODAL ACTION (APPROVE / REJECT) */}
      {/* ========================================== */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                {actionModal.type.includes("approve")
                  ? "Konfirmasi Persetujuan"
                  : "Konfirmasi Penolakan"}
              </h2>
              <button
                onClick={closeActionModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal Berdasarkan Tipe */}
            {actionModal.type.includes("approve") ? (
              <p className="text-slate-600 mb-6">
                Apakah Anda yakin ingin menyetujui permohonan ini dan
                melanjutkannya ke tahap berikutnya?
              </p>
            ) : (
              <div className="mb-6 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ketik alasan mengapa permohonan ini ditolak..."
                  rows={3}
                  // ✨ PERUBAHAN: Menambahkan text-slate-900 agar warna teks jadi hitam/gelap
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm text-slate-900"
                ></textarea>
              </div>
            )}

            {/* Footer / Buttons Modal */}
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={closeActionModal}
                disabled={!!loadingId}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitAction}
                disabled={
                  !!loadingId ||
                  (actionModal.type.includes("reject") && !rejectReason.trim())
                }
                className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                  ${
                    actionModal.type.includes("approve")
                      ? "bg-[#1a365d] hover:bg-[#12284a] shadow-blue-900/20"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  }`}
              >
                {loadingId ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : actionModal.type.includes("approve") ? (
                  "Lanjutkan"
                ) : (
                  "Submit Penolakan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ✨ MODAL NOTIFIKASI ANIMASI (SUCCESS / ERROR) */}
      {/* ========================================== */}
      {notif.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-10 flex flex-col items-center justify-center text-center shadow-2xl animate-in zoom-in-95 duration-300">
            {notif.status === "success" ? (
              <>
                <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30">
                    <Check className="w-8 h-8 text-white" strokeWidth={4} />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  Berhasil!
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  {notif.message}
                </p>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-75 duration-1000"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-rose-500 rounded-full shadow-lg shadow-rose-500/30">
                    <X className="w-8 h-8 text-white" strokeWidth={4} />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  Gagal
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-6">
                  {notif.message}
                </p>
                <button
                  onClick={() =>
                    setNotif({ isOpen: false, status: "success", message: "" })
                  }
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Tutup
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail Armada Utama (Tetap Dipertahankan) */}
      <AdminBookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
