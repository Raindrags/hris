import React, { useState } from "react";
import { X, Loader2, MapPin, Users, Car } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitRideShare({ bookingId, ...formData });

    if (success) {
      alert("Permintaan nebeng berhasil dikirim!");
      setFormData({ dropOff: "", seats: 1 }); // Reset form
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md relative shadow-2xl overflow-hidden">
        {/* HEADER MODAL */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1a365d]">
                Ikut Nebeng
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pesan kursi pada perjalanan ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">
              Titik Turun (Drop-off)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                required
                type="text"
                name="dropOff"
                value={formData.dropOff}
                onChange={handleChange}
                placeholder="Contoh: Gerbang Tol Pasteur"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 ml-1">
              Pastikan titik turun searah dengan tujuan utama.
            </p>
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* FOOTER BUTTON */}
          <div className="pt-4 mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-1/3 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-2/3 py-3 bg-[#1a365d] text-white rounded-xl font-bold hover:bg-[#12284a] shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                "Kirim Permintaan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
