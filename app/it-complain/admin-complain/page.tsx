"use client";

import {
  ComplaintTable,
  DashboardStatsPanel,
  HelpdeskLogs,
} from "./component/admin-complain-page";
import { useAdminHelpdesk } from "./hooks/admincomplains";

export default function AdminHelpdeskPage() {
  const admin = useAdminHelpdesk();

  return (
    <div className="w-full">
      {/* HEADER MECHA */}
      <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-slate-500 relative">
        <div className="absolute -bottom-[2px] left-8 w-48 h-[2px] bg-emerald-500"></div>
        <div>
          <h1 className="text-4xl font-black text-slate-200 tracking-widest uppercase flex items-center">
            <span className="text-emerald-500 mr-4">{"//"}</span> OMNI_ADMIN
          </h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-2">
            Pusat Komando Infrastruktur & IT Helpdesk
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: "dashboard", label: "DASHBOARD" },
          { id: "logs", label: "SYSTEM LOGS" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => admin.setActiveView(tab.id as any)}
            className={`px-6 py-2 font-bold text-sm uppercase tracking-wider transition-all border-2 ${
              admin.activeView === tab.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                : "bg-transparent text-slate-400 border-slate-600 hover:border-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW: DASHBOARD */}
      {admin.activeView === "dashboard" && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
          <DashboardStatsPanel stats={admin.stats} />

          {/* TABLE AREA */}
          <div
            className="bg-[#eef1f5] border-2 border-slate-400 p-6 relative shadow-xl"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)",
            }}
          >
            <div className="absolute top-0 left-0 w-8 h-8 bg-slate-800 flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 animate-pulse"></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 ml-10">
              {["NEW", "IN_PROGRESS", "WAITING_CONFIRMATION", "COMPLETED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => admin.setActiveTab(status as any)}
                    className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest border-2 ${
                      admin.activeTab === status
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-transparent text-slate-500 border-slate-400 hover:bg-slate-300"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </button>
                ),
              )}
            </div>

            <ComplaintTable
              data={admin.filteredComplaints}
              onAction={admin.openModal}
            />
          </div>
        </div>
      )}

      {/* VIEW: LOGS */}
      {admin.activeView === "logs" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <HelpdeskLogs
            logs={admin.filteredLogs}
            search={admin.logSearch}
            date={admin.logDate}
            onSearchChange={admin.setLogSearch}
            onDateChange={admin.setLogDate}
          />
        </div>
      )}

      {/* MODALS ACTION */}
      {admin.selectedTicket && admin.modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div
            className="bg-[#eef1f5] border-2 border-slate-800 p-8 max-w-lg w-full relative shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
            }}
          >
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-widest border-b-2 border-slate-300 pb-2 flex justify-between">
              <span>{admin.modalType}_PROTOCOL</span>
              <span className="text-emerald-600">
                {admin.selectedTicket.kodeTiket}
              </span>
            </h3>

            {/* FORM: TERIMA TUGAS */}
            {admin.modalType === "TERIMA" && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 tracking-widest uppercase">
                    Dikerjakan Oleh (Teknisi):
                  </label>
                  <input
                    type="text"
                    value={admin.dikerjakanOleh}
                    onChange={(e) => admin.setDikerjakanOleh(e.target.value)}
                    className="w-full bg-white border-2 border-slate-400 px-4 py-2 font-mono text-sm focus:outline-none focus:border-slate-800"
                    placeholder="NAMA TEKNISI..."
                  />
                </div>
              </div>
            )}

            {/* FORM: KONFIRMASI SELESAI */}
            {admin.modalType === "SELESAI" && (
              <div className="space-y-4 mb-6">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-4 border-l-2 border-amber-600 pl-2">
                  Meminta konfirmasi dari pelapor bahwa tiket telah
                  diselesaikan.
                </p>
                {["solusi", "saran", "keterangan"].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-600 mb-2 tracking-widest uppercase">
                      {field} (Opsional):
                    </label>
                    <textarea
                      value={(admin.formSelesai as any)[field]}
                      onChange={(e) =>
                        admin.setFormSelesai({
                          ...admin.formSelesai,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full bg-white border-2 border-slate-400 px-4 py-2 font-mono text-sm min-h-[80px] focus:outline-none focus:border-slate-800"
                      placeholder={`ISI ${field.toUpperCase()}...`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tombol Eksekusi */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={admin.closeModal}
                className="px-6 py-2 bg-slate-300 text-slate-800 font-bold uppercase tracking-widest hover:bg-slate-400 transition-colors"
              >
                TUTUP
              </button>
              {admin.modalType !== "DETAIL" && (
                <button
                  onClick={admin.handleAction}
                  className="px-6 py-2 bg-slate-800 text-white font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors relative"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  EXECUTE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
