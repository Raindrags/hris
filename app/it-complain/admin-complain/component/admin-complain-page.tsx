import React from "react";
import { ActionLog, AdminComplaint, DashboardStats } from "../type";


// --- A. SUMMARY CARDS ---
export const DashboardStatsPanel = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[
      {
        label: "LAPORAN MASUK",
        value: stats.masuk,
        color: "border-blue-500",
        text: "text-blue-500",
      },
      {
        label: "DIKERJAKAN",
        value: stats.dikerjakan,
        color: "border-amber-500",
        text: "text-amber-500",
      },
      {
        label: "SELESAI (BLN INI)",
        value: stats.selesai,
        color: "border-emerald-500",
        text: "text-emerald-500",
      },
    ].map((s, i) => (
      <div
        key={i}
        className={`bg-slate-800 border-l-4 ${s.color} p-6 relative group overflow-hidden`}
      >
        <div className="absolute right-0 top-0 opacity-10 text-6xl font-black -mt-4 -mr-2">
          {s.value}
        </div>
        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
          {s.label}
        </p>
        <p className={`text-4xl font-black mt-2 tracking-wider ${s.text}`}>
          {s.value}
        </p>
      </div>
    ))}
  </div>
);

// --- B. TABLE KELUHAN ---
export const ComplaintTable = ({
  data,
  onAction,
}: {
  data: AdminComplaint[];
  onAction: (
    t: AdminComplaint,
    type: "DETAIL" | "TERIMA" | "SELESAI" | "BATAL",
  ) => void;
}) => {
  return (
    <div className="overflow-x-auto bg-[#eef1f5] border-2 border-slate-400 p-2 relative">
      {/* Mecha Corner */}
      <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-slate-400"></div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800 text-slate-200 text-xs uppercase tracking-widest">
            <th className="p-4 border-b-2 border-slate-400">ID Laporan</th>
            <th className="p-4 border-b-2 border-slate-400">Lokasi & Divisi</th>
            <th className="p-4 border-b-2 border-slate-400">Status</th>
            <th className="p-4 border-b-2 border-slate-400 text-right">
              Action Protocol
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest"
              >
                NO_DATA_FOUND
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-300 hover:bg-slate-200 transition-colors"
              >
                <td className="p-4 font-bold text-slate-800">
                  {item.kodeTiket}
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold">{item.lokasi}</div>
                  <div className="text-xs text-slate-500">{item.divisi}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-slate-800 text-white text-[10px] uppercase font-bold tracking-wider">
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => onAction(item, "DETAIL")}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase hover:bg-blue-700"
                  >
                    Detail
                  </button>
                  {item.status === "NEW" && (
                    <button
                      onClick={() => onAction(item, "TERIMA")}
                      className="px-3 py-1 bg-amber-600 text-white text-xs font-bold uppercase hover:bg-amber-700"
                    >
                      Terima
                    </button>
                  )}
                  {item.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => onAction(item, "SELESAI")}
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase hover:bg-emerald-700"
                    >
                      Konfirm Selesai
                    </button>
                  )}
                  {(item.status === "NEW" || item.status === "IN_PROGRESS") && (
                    <button
                      onClick={() => onAction(item, "BATAL")}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700"
                    >
                      Batal
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- C. LOG HELPDESK ---
export const HelpdeskLogs = ({
  logs,
  search,
  date,
  onSearchChange,
  onDateChange,
}: {
  logs: ActionLog[];
  search: string;
  date: string;
  onSearchChange: (s: string) => void;
  onDateChange: (d: string) => void;
}) => (
  <div
    className="bg-[#eef1f5] border-2 border-slate-400 p-6 relative shadow-lg"
    style={{
      clipPath:
        "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
    }}
  >
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="CARI NOMOR LAPORAN / KATA KUNCI..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-white border-2 border-slate-400 px-4 py-2 font-mono text-sm uppercase placeholder-slate-400 focus:outline-none focus:border-slate-800"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full md:w-64 bg-white border-2 border-slate-400 px-4 py-2 font-mono text-sm focus:outline-none focus:border-slate-800"
      />
    </div>

    <div className="space-y-4">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex border-l-4 border-slate-800 bg-white p-4 items-start shadow-sm"
        >
          <div className="min-w-[120px] text-xs text-slate-500 font-bold border-r-2 border-slate-200 mr-4 pr-4">
            {new Date(log.timestamp).toLocaleString("id-ID", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </div>
          <div>
            <div className="flex space-x-2 items-center mb-1">
              <span className="font-black text-slate-800 text-sm tracking-wider">
                {log.kodeTiket}
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 font-bold uppercase">
                {log.action}
              </span>
            </div>
            <p className="text-sm text-slate-700">
              {log.message}{" "}
              <span className="text-emerald-600 font-bold">[{log.actor}]</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
