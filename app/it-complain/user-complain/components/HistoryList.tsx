import React from "react";
import { ComplaintSubmission } from "../types/complaint";
import { Clock, Database } from "lucide-react";

export const HistoryList: React.FC<{ history: ComplaintSubmission[] }> = ({
  history,
}) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80">
        <Database className="w-12 h-12 mb-4 opacity-30 text-cyan-500" />
        <p className="text-sm">
          Sistem belum mendata histori pengajuan dari sesi ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 hover:border-cyan-800 transition-all flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${item.type === "IT" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50" : "bg-indigo-950 text-indigo-400 border border-indigo-800/50"}`}
              >
                {item.type === "IT" ? "KELUHAN IT" : "CEK CCTV"}
              </span>
              <span className="text-sm text-slate-400 font-mono">
                {item.createdAt.toLocaleDateString()}{" "}
                {item.createdAt.toLocaleTimeString()}
              </span>
            </div>
            <h4 className="text-slate-200 font-medium">
              {item.type === "IT"
                ? (item.data as any).masalah
                : (item.data as any).masalah}
            </h4>
            <p className="text-slate-500 text-sm mt-1">
              {item.type === "IT"
                ? `Lokasi: ${(item.data as any).lokasi}`
                : `Titik: ${(item.data as any).titikLokasi}`}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="flex items-center text-sm font-medium text-amber-400 bg-amber-950/40 px-4 py-2 rounded-lg border border-amber-500/20">
              <Clock className="w-4 h-4 mr-2" /> {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
