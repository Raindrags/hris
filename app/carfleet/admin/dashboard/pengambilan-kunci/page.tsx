"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Clock,
  Car,
  MapPin,
  User,
  Check,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ScheduleItem = {
  id: string;
  type: "BOOKING" | "ROUTINE";
  dateStr: string; // Format: DD MMM YYYY
  time: string;
  destination: string;
  vehicleName: string;
  platNumber: string;
  requesterName: string;
  requesterPhone: string | null;
  sortTimestamp: number;
};

export default function PengambilanKunciPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(
    null,
  );

  // State Form
  const [takerName, setTakerName] = useState("");
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Fetch data dari Proxy API
  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kunci/schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error("Gagal mengambil data jadwal", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const openModal = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setTakerName(schedule.requesterName); // Default ke nama peminjam
    setNotes("");

    // Set auto timestamp
    const now = new Date();
    setCurrentTime(
      now.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    );

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    try {
      const payload = {
        scheduleId: selectedSchedule.id,
        type: selectedSchedule.type,
        takerName,
        notes,
        timestamp: new Date().toISOString(),
        requesterPhone: selectedSchedule.requesterPhone,
      };

      const res = await fetch("/api/kunci/takes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Kunci berhasil diambil! Notifikasi dikirim (jika bukan rutin).");
        setIsModalOpen(false);
        fetchSchedules(); // Refresh tabel
      } else {
        alert("Gagal memproses pengambilan kunci.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <Key className="text-amber-500" /> Log Pengambilan Kunci
        </h1>
        <Button
          onClick={fetchSchedules}
          variant="outline"
          className="text-slate-700 bg-white"
        >
          <Clock size={16} className="mr-2" /> Refresh Jadwal
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-700">
                Waktu Berangkat
              </th>
              <th className="p-4 font-semibold text-slate-700">Kendaraan</th>
              <th className="p-4 font-semibold text-slate-700">
                Tujuan & Peminjam
              </th>
              <th className="p-4 font-semibold text-slate-700">Tipe</th>
              <th className="p-4 font-semibold text-center text-slate-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Memuat jadwal terdekat...
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-slate-500 bg-slate-50/50"
                >
                  Tidak ada jadwal keberangkatan terdekat.
                </td>
              </tr>
            ) : (
              schedules.map((s) => (
                <tr
                  key={s.id}
                  className="border-b hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{s.time} WIB</div>
                    <div className="text-xs text-slate-500">{s.dateStr}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      <Car size={14} className="text-slate-400" />{" "}
                      {s.vehicleName}
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 text-slate-600 bg-slate-50"
                    >
                      {s.platNumber}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      <MapPin size={14} className="text-red-400" />{" "}
                      {s.destination}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <User size={12} /> {s.requesterName}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.type === "ROUTINE" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {s.type === "ROUTINE" ? "Jadwal Rutin" : "Booking Baru"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      onClick={() => openModal(s)}
                      className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-medium"
                      size="sm"
                    >
                      <Key size={14} className="mr-1.5" /> Ambil Kunci
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL AMBIL KUNCI */}
      {isModalOpen && selectedSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Key size={18} className="text-amber-500" /> Form Pengambilan
                Kunci
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-2">
                <div className="text-xs font-medium text-amber-800 mb-1">
                  Kendaraan yang diambil:
                </div>
                <div className="font-bold text-amber-900">
                  {selectedSchedule.vehicleName} ({selectedSchedule.platNumber})
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                  <User size={14} /> Nama Pengambil Kunci
                </label>
                <Input
                  required
                  value={takerName}
                  onChange={(e) => setTakerName(e.target.value)}
                  className="text-slate-900 focus-visible:ring-amber-500"
                  placeholder="Nama pengambil..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                  <FileText size={14} /> Catatan Tambahan{" "}
                  <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-slate-900 focus-visible:ring-amber-500"
                  placeholder="Misal: Kunci serep yang diambil..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                  <Clock size={14} /> Timestamp Otomatis
                </label>
                <Input
                  disabled
                  value={currentTime}
                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-700 border-slate-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Check size={16} className="mr-1.5" /> Submit & Berikan Kunci
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
