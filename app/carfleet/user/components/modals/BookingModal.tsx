import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  User,
  Phone,
} from "lucide-react";
import { useUserBooking } from "@/app/carfleet/context/UserBookingContext";

interface BookingModalProps {
  selectedFleetName: string;
  selectedDate: string;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  isOpen?: boolean;
}

export default function BookingModal({
  selectedFleetName,
  selectedDate,
  onClose,
  onSubmit,
  isOpen = true,
}: BookingModalProps) {
  const { isLoading } = useUserBooking();

  const initialFormState = {
    picName: "",
    contactNumber: "",
    driverName: "",
    purpose: "",
    destination: "",
    date: selectedDate || "",
    timeOut: "",
    timeIn: "",
    passengers: 1,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Efek kiriman tanggal jika sewaktu-waktu berubah dari parent
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }));
    }
  }, [selectedDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✨ Helper untuk menutup dan mereset form agar data tidak nyangkut
  const handleClose = () => {
    setFormData(initialFormState);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onSubmit(formData);
      // Reset form dan tutup setelah sukses
      handleClose();
    } catch (error) {
      console.error("Gagal mengirim permohonan:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      // ✨ Fitur tutup kalau klik di luar area form
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
        // ✨ Mencegah form tertutup kalau user klik di DALAM area putih form
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a365d]">
              Ajukan Peminjaman {selectedFleetName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Lengkapi data perjalanan Anda di bawah ini.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECTION 1: Informasi Penanggung Jawab */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
              Informasi Pemohon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Nama PIC (Penanggung Jawab)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="text"
                    name="picName"
                    value={formData.picName}
                    onChange={handleChange}
                    placeholder="Contoh: Bpk. Ahmad"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Nomor HP/WA Aktif
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Contoh: 08123456789"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Detail Perjalanan */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
              Detail Perjalanan
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">
                Tujuan Perjalanan
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Contoh: Dinas Pendidikan Kota"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Tanggal
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Jam Keluar
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="time"
                    name="timeOut"
                    value={formData.timeOut}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Estimasi Jam Kembali
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="time"
                    name="timeIn"
                    value={formData.timeIn}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Supir (Opsional / Jika Bawa Sendiri)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    placeholder="Nama Supir / Bawa Sendiri"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Jumlah Penumpang
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="number"
                    min="1"
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    placeholder="Termasuk supir"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Keperluan */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">
              Keperluan / Keterangan
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                required
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Jelaskan secara singkat keperluan perjalanan ini..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* FOOTER BUTTON */}
          <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-[#1a365d] text-white rounded-xl font-bold hover:bg-[#12284a] shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                "Kirim Permohonan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
