import React, { useState } from "react";
import { X, Loader2, Users, Check } from "lucide-react";
import { useUserBooking } from "@/app/carfleet/context/UserBookingContext";

interface JoinRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string; // ID perjalanan yang akan ditebeng
}

export default function JoinRideModal({
  isOpen,
  onClose,
  bookingId,
}: JoinRideModalProps) {
  const { submitRideShare, isLoading } = useUserBooking();

  // State untuk mengontrol tampilan Notifikasi Animasi (Bukan Alert Browser)
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const [formData, setFormData] = useState({
    dropOff: "",
    seats: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "seats" ? parseInt(value) || 1 : value,
    });
  };

  const handleClose = () => {
    setFormData({ dropOff: "", seats: 1 });
    setSubmitStatus("idle");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRideShare({ bookingId, ...formData });

      // ✨ TAMPILKAN ANIMASI SUKSES (TIDAK PAKAI ALERT)
      setSubmitStatus("success");
      setSubmitMessage("Permintaan nebeng berhasil dikirim!");

      // Tutup modal otomatis setelah 2 detik
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      // ✨ TAMPILKAN ANIMASI GAGAL
      setSubmitStatus("error");
      setSubmitMessage(error.message || "Gagal mengirim permintaan nebeng.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {submitStatus === "idle" ? (
          <>
            {/* HEADER */}
            <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-20 shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-[#1a365d]">
                  Ikut Nebeng
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Isi detail perjalanan Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM BODY */}
            <div className="p-6 bg-slate-50/50">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    Tujuan Berhenti (Drop-off)
                  </label>
                  <input
                    required
                    type="text"
                    name="dropOff"
                    value={formData.dropOff}
                    onChange={handleChange}
                    placeholder="Contoh: Gedung A / Ruko Depan..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    Jumlah Kursi yang Dibutuhkan
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="number"
                      min="1"
                      name="seats"
                      value={formData.seats}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="w-1/3 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-3 bg-[#1a365d] text-white rounded-xl font-bold hover:bg-[#12284a] shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-70 transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
                        Proses...
                      </>
                    ) : (
                      "Kirim Pengajuan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* ✨ TAMPILAN ANIMASI SUKSES / GAGAL (MODAL INTERNAL) */
          <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[350px] animate-in zoom-in-95 duration-300">
            {submitStatus === "success" ? (
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
                <p className="text-slate-500 text-sm font-medium">
                  {submitMessage}
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
                  Gagal Diproses
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-6">
                  {submitMessage}
                </p>
                <button
                  onClick={() => setSubmitStatus("idle")}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition"
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
