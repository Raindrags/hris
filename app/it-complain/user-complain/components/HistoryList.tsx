"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Database, Star, CheckCircle2 } from "lucide-react";
import { ComplaintSubmission } from "../type";

interface HistoryListProps {
  history?: ComplaintSubmission[] | any;
  onConfirm?: (
    id: string,
    rating: number,
    ulasanUser?: string,
  ) => Promise<boolean>;
}

const formatTanggalKejadian = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return dateStr;

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onConfirm,
}) => {
  // Normalisasi agar selalu berbentuk array
  const safeHistory: ComplaintSubmission[] = Array.isArray(history)
    ? history
    : Array.isArray(history?.data)
      ? history.data
      : [];

  const [selectedItem, setSelectedItem] = useState<ComplaintSubmission | null>(
    null,
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ulasanUser, setUlasanUser] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const openDetailModal = (item: ComplaintSubmission) => {
    setSelectedItem(item);
    setRating(item.rating || 5);
    setHoverRating(0);
    setUlasanUser(item.ulasanUser || "");
  };

  const handleConfirmSubmit = async () => {
    if (!selectedItem?.id || !onConfirm) return;
    setIsSubmitting(true);
    const success = await onConfirm(selectedItem.id, rating, ulasanUser);
    setIsSubmitting(false);
    if (success) {
      setSelectedItem(null);
    }
  };

  const getStatusButtonStyle = (status: string) => {
    const normalized = status?.toUpperCase();
    if (normalized === "DIPROSES") {
      return "bg-amber-300 hover:bg-amber-400 text-slate-800";
    }
    if (normalized === "MENUNGGU_KONFIRMASI") {
      return "bg-cyan-300 hover:bg-cyan-400 text-slate-900";
    }
    if (normalized === "SELESAI") {
      return "bg-emerald-400 hover:bg-emerald-500 text-slate-900";
    }
    return "bg-slate-200 hover:bg-slate-300 text-slate-800";
  };

  const needsConfirmation = (item: ComplaintSubmission) => {
    const st = item.status?.toUpperCase();
    return st === "MENUNGGU_KONFIRMASI" || (st === "SELESAI" && !item.rating);
  };

  // STATE: KOSONG
  if (safeHistory.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-slate-500 bg-white/40 border-2 border-slate-300 font-mono relative"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
        }}
      >
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-400"></div>
        <div className="absolute bottom-4 right-4 text-[10px] font-bold tracking-widest text-slate-400">
          ERR_NO_DATA
        </div>

        <Database className="w-12 h-12 mb-4 opacity-50 text-slate-400" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          SISTEM BELUM MENDATA HISTORI PENGAJUAN
        </p>
      </div>
    );
  }

  const tanggalKejadianCctv = selectedItem
    ? (selectedItem.data as any)?.tanggalKejadian ||
      (selectedItem as any)?.tanggalKejadian
    : null;

  // MODAL PORTAL (Render langsung di document.body agar tidak terpotong container induk)
  const modalContent =
    selectedItem && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div
              className="bg-[#eef1f5] border-2 border-slate-800 max-w-lg w-full relative shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
              }}
            >
              {/* Header Modal (Tetap di atas) */}
              <div className="px-6 pt-6 pb-3 shrink-0">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-300 pb-2 flex justify-between items-center font-mono">
                  <span>DETAIL_PROTOCOL</span>
                  <span className="text-emerald-600 text-base">
                    {selectedItem.kodeTiket || selectedItem.id || "-"}
                  </span>
                </h3>
              </div>

              {/* Konten Modal (Bisa di-scroll jika panjang) */}
              <div className="px-6 py-2 overflow-y-auto space-y-4 font-mono text-sm flex-1">
                {/* Baris 1: Status & Waktu Pengerjaan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border-2 border-slate-300 p-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Status Tiket
                    </span>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      {selectedItem.status?.replace("_", " ")}
                    </span>
                  </div>

                  <div className="bg-white border-2 border-slate-300 p-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Waktu Pengerjaan / Update
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(
                        selectedItem.updatedAt || selectedItem.createdAt,
                      ).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                {/* Baris 2: Identitas User & Teknisi */}
                <div className="bg-white border-l-4 border-blue-600 border-y border-r border-slate-300 p-3 space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Identitas User & Teknisi
                  </span>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Pelapor:</span>
                    <span className="font-bold text-slate-800">
                      {selectedItem.user?.nama || "-"}
                      {selectedItem.user?.niy
                        ? ` (${selectedItem.user.niy})`
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Divisi:</span>
                    <span className="font-bold text-slate-800">
                      {selectedItem.user?.divisi || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Dikerjakan Oleh:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedItem.dikerjakanOleh || "Belum ditentukan"}
                    </span>
                  </div>
                </div>

                {/* Baris 3: Data Kendala */}
                <div className="bg-white border-l-4 border-slate-800 border-y border-r border-slate-300 p-3 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Data Kendala
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 uppercase">
                      {selectedItem.type}
                      {selectedItem.type === "IT" &&
                      (selectedItem.data as any)?.kategori
                        ? ` • ${(selectedItem.data as any).kategori}`
                        : ""}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">Lokasi: </span>
                      <span className="font-bold text-slate-800">
                        {selectedItem.type === "IT"
                          ? (selectedItem.data as any)?.lokasi
                          : (selectedItem.data as any)?.titikLokasi}
                      </span>
                    </div>

                    {selectedItem.type === "CCTV" && tanggalKejadianCctv && (
                      <div>
                        <span className="text-slate-500">
                          Tanggal Kejadian:{" "}
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatTanggalKejadian(tanggalKejadianCctv)}
                        </span>
                      </div>
                    )}

                    {selectedItem.type === "CCTV" &&
                      (selectedItem.data as any)?.perkiraanJam && (
                        <div>
                          <span className="text-slate-500">Perkiraan Jam: </span>
                          <span className="font-bold text-slate-800">
                            {(selectedItem.data as any).perkiraanJam}
                          </span>
                        </div>
                      )}

                    <div className="pt-1">
                      <span className="block text-slate-500 mb-1">
                        Deskripsi Masalah:
                      </span>
                      <p className="bg-slate-100 border border-slate-300 p-2.5 text-slate-800 whitespace-pre-line leading-relaxed">
                        {selectedItem.data?.masalah}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Baris 4: Catatan Penyelesaian Teknisi */}
                {(selectedItem.solusi ||
                  selectedItem.saran ||
                  selectedItem.keterangan) && (
                  <div className="bg-white border-l-4 border-emerald-600 border-y border-r border-slate-300 p-3 space-y-1.5 text-xs">
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                      Catatan Penyelesaian
                    </span>
                    {selectedItem.solusi && (
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Solusi:</strong>{" "}
                        {selectedItem.solusi}
                      </p>
                    )}
                    {selectedItem.saran && (
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Saran:</strong>{" "}
                        {selectedItem.saran}
                      </p>
                    )}
                    {selectedItem.keterangan && (
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Keterangan:</strong>{" "}
                        {selectedItem.keterangan}
                      </p>
                    )}
                  </div>
                )}

                {/* Baris 5: FORM KONFIRMASI SELESAI & RATING PELAPOR */}
                {needsConfirmation(selectedItem) && onConfirm && (
                  <div className="bg-amber-50 border-2 border-amber-500 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-800 uppercase tracking-widest">
                        Konfirmasi Selesai & Penilaian Layanan
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        {rating}/5 Bintang
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">
                        Ulasan / Masukan (Opsional):
                      </label>
                      <textarea
                        value={ulasanUser}
                        onChange={(e) => setUlasanUser(e.target.value)}
                        placeholder="TULIS ULASAN PELAYANAN IT..."
                        className="w-full bg-white border-2 border-slate-400 px-3 py-2 text-xs text-slate-800 min-h-[65px] focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* Tampilan Rating jika sudah dikonfirmasi */}
                {selectedItem.rating && !needsConfirmation(selectedItem) && (
                  <div className="bg-white border-l-4 border-amber-500 border-y border-r border-slate-300 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                        Penilaian Pelapor
                      </span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (selectedItem.rating || 0)
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {selectedItem.ulasanUser && (
                      <p className="text-slate-700 italic">
                        "{selectedItem.ulasanUser}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Modal (Tombol tetap di bawah) */}
              <div className="px-6 pt-3 pb-6 border-t border-slate-300 flex justify-end space-x-3 shrink-0 bg-[#eef1f5]">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2 bg-slate-300 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-400 transition-colors cursor-pointer"
                >
                  TUTUP
                </button>

                {needsConfirmation(selectedItem) && onConfirm && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmSubmit}
                    className="px-5 py-2 bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center cursor-pointer disabled:opacity-50"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isSubmitting ? "MENYIMPAN..." : "KONFIRMASI SELESAI"}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  // STATE: ADA DATA
  return (
    <>
      <div className="space-y-6 font-mono">
        {safeHistory.map((item, index) => (
          <div
            key={item.id || index}
            className="relative bg-white/60 border-2 border-slate-400 p-5 transition-all hover:bg-slate-200 group flex flex-col md:flex-row justify-between items-start md:items-center"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)",
            }}
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-400 group-hover:bg-slate-800 transition-colors"></div>

            <div className="pl-4">
              <div className="flex items-center space-x-4 mb-3">
                <span
                  className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase border-2 flex items-center ${
                    item.type === "IT"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-transparent text-slate-800 border-slate-800"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 mr-2 ${item.type === "IT" ? "bg-white" : "bg-slate-800"}`}
                  ></div>
                  {item.type === "IT" ? "LOG_IT" : "LOG_CCTV"}
                </span>

                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center">
                  <span className="mr-2 text-slate-300">///</span>
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  <span className="mx-2">|</span>
                  {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <h4 className="text-slate-800 font-black text-sm uppercase tracking-wide mb-1">
                {item.data?.masalah}
              </h4>

              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                [LOC]:{" "}
                {item.type === "IT"
                  ? (item.data as any)?.lokasi
                  : (item.data as any)?.titikLokasi}
              </p>
            </div>

            <div className="mt-6 md:mt-0 ml-4 md:ml-0 flex items-center relative z-10">
              <div className="hidden md:flex flex-col space-y-1 mr-4 opacity-50">
                <div className="w-4 h-[2px] bg-slate-500"></div>
                <div className="w-8 h-[2px] bg-slate-500"></div>
                <div className="w-6 h-[2px] bg-slate-500"></div>
              </div>

              <button
                type="button"
                onClick={() => openDetailModal(item)}
                title="Klik untuk melihat detail & konfirmasi"
                className={`flex items-center text-[10px] font-black border-2 border-slate-800 px-4 py-2 uppercase tracking-widest cursor-pointer transition-all active:scale-95 ${getStatusButtonStyle(item.status)}`}
                style={{
                  clipPath:
                    "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                }}
              >
                <span className="mr-2 font-bold animate-pulse">{">"}</span>
                STATUS: {item.status?.replace("_", " ")}
              </button>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[40px] font-black text-slate-400 opacity-10 pointer-events-none">
              {String(index + 1).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      {modalContent}
    </>
  );
};