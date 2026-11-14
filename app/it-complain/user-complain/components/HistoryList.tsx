import React from "react";
import { Database } from "lucide-react";
import { ComplaintSubmission } from "../type";

export const HistoryList: React.FC<{ history: ComplaintSubmission[] }> = ({
  history,
}) => {
  // STATE: KOSONG
  if (history.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-slate-500 bg-white/40 border-2 border-slate-300 font-mono relative"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
        }}
      >
        {/* Dekorasi HUD Kosong */}
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

  // STATE: ADA DATA
  return (
    <div className="space-y-6 font-mono">
      {history.map((item, index) => (
        <div
          key={item.id}
          className="relative bg-white/60 border-2 border-slate-400 p-5 transition-all hover:bg-slate-200 group flex flex-col md:flex-row justify-between items-start md:items-center"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)",
          }}
        >
          {/* Elemen Dekoratif Kiri Atas */}
          <div className="absolute top-0 left-0 w-2 h-full bg-slate-400 group-hover:bg-slate-800 transition-colors"></div>

          <div className="pl-4">
            <div className="flex items-center space-x-4 mb-3">
              {/* Badge Tipe Laporan */}
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

              {/* Timestamp */}
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center">
                <span className="mr-2 text-slate-300">///</span>
                {item.createdAt.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                <span className="mx-2">|</span>
                {item.createdAt.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Judul Laporan */}
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wide mb-1">
              {item.type === "IT"
                ? (item.data as any).masalah
                : (item.data as any).masalah}
            </h4>

            {/* Meta Data Tambahan (Lokasi dll) */}
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              [LOC]:{" "}
              {item.type === "IT"
                ? (item.data as any).lokasi
                : (item.data as any).titikLokasi}
            </p>
          </div>

          {/* Status Laporan */}
          <div className="mt-6 md:mt-0 ml-4 md:ml-0 flex items-center">
            <div className="hidden md:flex flex-col space-y-1 mr-4 opacity-50">
              <div className="w-4 h-[2px] bg-slate-500"></div>
              <div className="w-8 h-[2px] bg-slate-500"></div>
              <div className="w-6 h-[2px] bg-slate-500"></div>
            </div>

            <span
              className="flex items-center text-[10px] font-black text-slate-800 bg-amber-300 border-2 border-slate-800 px-4 py-2 uppercase tracking-widest"
              style={{
                clipPath:
                  "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
              }}
            >
              {/* Ornamen panah loading / status */}
              <span className="mr-2 font-bold animate-pulse">{">"}</span>
              STATUS: {item.status}
            </span>
          </div>

          {/* Index Urutan Transparan di background */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[40px] font-black text-slate-400 opacity-10 pointer-events-none">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>
      ))}
    </div>
  );
};
