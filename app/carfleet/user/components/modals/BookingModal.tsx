import React, { useState, useEffect } from "react";
import { X, Loader2, MapPin, FileText, Car, Bolt } from "lucide-react";
import { useUserBooking } from "@/app/carfleet/context/UserBookingContext";

interface BookingModalProps {
  isOpen: boolean;
  selectedFleetName: string;
  selectedDate: Date | null;
  isNowInitially?: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

// Helper untuk membaca cookie
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function BookingModal({
  isOpen,
  selectedFleetName,
  selectedDate,
  isNowInitially = false,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const { isLoading } = useUserBooking();
  const [isNow, setIsNow] = useState(isNowInitially);

  // Helper untuk mengubah Object Date ke format YYYY-MM-DD
  const formatInitialDate = (d: Date | null) =>
    d ? d.toISOString().split("T")[0] : "";

  // Mengambil data user dari cookie
  const [userData, setUserData] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (isOpen) {
      const userDataCookie = getCookie("user_data");
      if (userDataCookie) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
          setUserData({
            name: parsedUser.name || "User",
            phone: parsedUser.phone || "-",
          });
        } catch (error) {
          console.error("Gagal membaca cookie user_data:", error);
        }
      }
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    purpose: "",
    destination: "",
    date: formatInitialDate(selectedDate),
    timeOut: "",
    timeIn: "",
  });

  // Sinkronisasi data ketika props berubah
  useEffect(() => {
    setIsNow(isNowInitially);
    if (isNowInitially) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setFormData((prev) => ({
        ...prev,
        timeOut: currentTime,
        date: formatInitialDate(now),
      }));
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: formatInitialDate(selectedDate),
        timeOut: "",
      }));
    }
  }, [isNowInitially, selectedDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleNow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsNow(checked);
    if (checked) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setFormData((prev) => ({
        ...prev,
        timeOut: currentTime,
        date: formatInitialDate(now),
      }));
    } else {
      setFormData((prev) => ({ ...prev, timeOut: "" }));
    }
  };

  const handleClose = () => {
    setFormData({
      purpose: "",
      destination: "",
      date: formatInitialDate(selectedDate),
      timeOut: "",
      timeIn: "",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Menggabungkan data inputan user dengan data otomatis sebelum dikirim
      const finalData = {
        ...formData,
        picName: userData.name,
        contactNumber: userData.phone,
        driverName: userData.name, // Otomatis driver adalah user yang login
        passengers: 1, // Default otomatis 1
      };

      await onSubmit(finalData);
      handleClose();
    } catch (error) {
      console.error("Gagal mengirim permohonan:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-xl max-h-[95vh] overflow-y-auto relative shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-20 rounded-t-[2rem] shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a365d]">
              Detail Peminjaman
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
        <div className="p-6 bg-slate-50/50 flex-1">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-[#1a365d] rounded-xl flex justify-center items-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Kendaraan Terpilih
              </p>
              <p className="font-bold text-slate-900 leading-tight">
                {selectedFleetName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Tanggal
              </p>
              <p className="font-bold text-[#1a365d] text-sm">
                {selectedDate
                  ? selectedDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} id="booking-form" className="space-y-6">
            {/* WAKTU CERDAS (TOGGLE) */}
            <div
              className={`p-5 rounded-2xl border shadow-sm relative transition-colors ${isNow ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200"}`}
            >
              <div className="absolute -top-3 left-4 bg-white px-2 rounded-full">
                <label className="flex items-center cursor-pointer gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isNow}
                      onChange={handleToggleNow}
                      className="sr-only"
                    />
                    <div
                      className={`block w-10 h-6 rounded-full transition-colors duration-300 ${isNow ? "bg-blue-600" : "bg-slate-200"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isNow ? "translate-x-4" : ""}`}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-[#1a365d]">
                    <Bolt className="inline w-3 h-3 text-yellow-500 mr-1" />{" "}
                    Berangkat Sekarang
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Jam Keluar
                  </label>
                  <input
                    required
                    type="time"
                    name="timeOut"
                    value={formData.timeOut}
                    onChange={handleChange}
                    readOnly={isNow}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-sm font-semibold ${isNow ? "bg-blue-100 border-blue-200 text-blue-800" : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Est. Kembali
                  </label>
                  <input
                    required
                    type="time"
                    name="timeIn"
                    value={formData.timeIn}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* DETAIL PERJALANAN (HANYA TUJUAN DAN KEPERLUAN) */}
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
                  placeholder="Contoh: Kunjungan Klien, Rapat Dinas..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">
                Keperluan (Opsional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Catatan tambahan untuk admin..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm resize-none"
                ></textarea>
              </div>
            </div>

            {/* INFO OTOMATIS */}
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-800 font-medium text-center">
              Permohonan diajukan atas nama <b>{userData.name}</b>
            </div>
          </form>
        </div>

        {/* FOOTER MODAL */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-[2rem] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-[#1a365d] text-white rounded-xl font-bold hover:bg-[#12284a] shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...
              </>
            ) : (
              "Kirim Permohonan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
