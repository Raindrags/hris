import React, { useState } from "react";
import { X, Loader2, Package, FileText, UserCheck } from "lucide-react";
import { useUserBooking } from "@/app/carfleet/context/UserBookingContext";

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string; // ID perjalanan
}

export default function PackageModal({
  isOpen,
  onClose,
  bookingId,
}: PackageModalProps) {
  const { submitPackage, isLoading } = useUserBooking();

  const [formData, setFormData] = useState({
    description: "",
    receiver: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitPackage({ bookingId, ...formData });

    if (success) {
      alert("Permintaan titip barang/dokumen berhasil dikirim!");
      setFormData({ description: "", receiver: "" }); // Reset form
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
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1a365d]">
                Titip Barang
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kirim dokumen/barang via armada
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
              Deskripsi Barang / Dokumen
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                required
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Contoh: Map Merah SPJ Bos"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">
              Penerima & Lokasi
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                required
                type="text"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                placeholder="Contoh: Bpk. Budi (Diknas Lt. 2)"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 ml-1">
              Pastikan nama penerima dan detail lokasi jelas untuk supir.
            </p>
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
                "Titipkan Barang"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
