"use client";

import { Star } from "lucide-react";
import {
  ComplaintTable,
  DashboardStatsPanel,
  HelpdeskLogs,
} from "./component/admin-complain-page";
import { useAdminHelpdesk } from "./hooks/admincomplains";

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
            className="bg-[#eef1f5] border-2 border-slate-800 p-8 max-w-lg w-full relative shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
            }}
          >
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-widest border-b-2 border-slate-300 pb-2 flex justify-between items-center">
              <span>{admin.modalType}_PROTOCOL</span>
              <span className="text-emerald-600 text-base">
                {admin.selectedTicket.kodeTiket}
              </span>
            </h3>

            {/* DETAIL TICKET */}
            {admin.modalType === "DETAIL" && (
              <div className="space-y-4 mb-6 font-mono text-sm">
                {/* Baris 1: Status & Date-Time Pengerjaan (updatedAt) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border-2 border-slate-300 p-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Status Tiket
                    </span>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      {admin.selectedTicket.rawStatus ||
                        admin.selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="bg-white border-2 border-slate-300 p-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Waktu Pengerjaan / Update
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {admin.selectedTicket.updatedAt
                        ? new Date(
                            admin.selectedTicket.updatedAt,
                          ).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "-"}
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
                      {admin.selectedTicket.pelapor}
                      {admin.selectedTicket.niy &&
                      admin.selectedTicket.niy !== "-"
                        ? ` (${admin.selectedTicket.niy})`
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Divisi:</span>
                    <span className="font-bold text-slate-800">
                      {admin.selectedTicket.divisi}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Dikerjakan Oleh:</span>
                    <span className="font-bold text-emerald-700">
                      {admin.selectedTicket.dikerjakanOleh || "Belum ditentukan"}
                    </span>
                  </div>
                </div>

                {/* Baris 3: Data Kendala (IT / CCTV) */}
                <div className="bg-white border-l-4 border-slate-800 border-y border-r border-slate-300 p-3 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Data Kendala
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 uppercase">
                      {admin.selectedTicket.type || "IT"}
                      {admin.selectedTicket.kategoriIT
                        ? ` • ${admin.selectedTicket.kategoriIT}`
                        : ""}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">Lokasi: </span>
                      <span className="font-bold text-slate-800">
                        {admin.selectedTicket.lokasi}
                      </span>
                    </div>

                    {admin.selectedTicket.tanggalKejadian && (
                      <div>
                        <span className="text-slate-500">
                          Tanggal Kejadian:{" "}
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatTanggalKejadian(
                            admin.selectedTicket.tanggalKejadian,
                          )}
                        </span>
                      </div>
                    )}

                    {admin.selectedTicket.perkiraanJam && (
                      <div>
                        <span className="text-slate-500">Perkiraan Jam: </span>
                        <span className="font-bold text-slate-800">
                          {admin.selectedTicket.perkiraanJam}
                        </span>
                      </div>
                    )}

                    <div className="pt-1">
                      <span className="block text-slate-500 mb-1">
                        Deskripsi Masalah:
                      </span>
                      <p className="bg-slate-100 border border-slate-300 p-2.5 text-slate-800 whitespace-pre-line leading-relaxed">
                        {admin.selectedTicket.masalah}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Baris 4: Catatan Penyelesaian */}
                {(admin.selectedTicket.solusi ||
                  admin.selectedTicket.saran ||
                  admin.selectedTicket.keterangan) && (
                  <div className="bg-white border-l-4 border-emerald-600 border-y border-r border-slate-300 p-3 space-y-1.5 text-xs">
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                      Catatan Penyelesaian
                    </span>
                    {admin.selectedTicket.solusi && (
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Solusi:</strong>{" "}
                        {admin.selectedTicket.solusi}
                      </p>
                    )}
                    {admin.selectedTicket.saran && (
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Saran:</strong>{" "}
                        {admin.selectedTicket.saran}
                      </p>
                    )}
                    {admin.selectedTicket.keterangan && (
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Keterangan:</strong>{" "}
                        {admin.selectedTicket.keterangan}
                      </p>
                    )}
                  </div>
                )}

                {/* Baris 5: Penilaian & Ulasan dari User */}
                {(admin.selectedTicket.rating != null ||
                  admin.selectedTicket.ulasanUser ||
                  admin.selectedTicket.status === "COMPLETED") && (
                  <div className="bg-white border-l-4 border-amber-500 border-y border-r border-slate-300 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                        Penilaian & Ulasan User
                      </span>

                      {admin.selectedTicket.rating != null ? (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (admin.selectedTicket?.rating || 0)
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1.5 font-bold text-slate-700">
                            ({admin.selectedTicket.rating}/5)
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Belum dinilai
                        </span>
                      )}
                    </div>

                    {admin.selectedTicket.ulasanUser ? (
                      <div>
                        <span className="block text-slate-500 mb-1">
                          Ulasan Pelapor:
                        </span>
                        <p className="bg-amber-50/70 border border-amber-200 p-2.5 text-slate-800 italic whitespace-pre-line leading-relaxed">
                          "{admin.selectedTicket.ulasanUser}"
                        </p>
                      </div>
                    ) : (
                      admin.selectedTicket.rating != null && (
                        <p className="text-slate-400 italic">
                          Pelapor memberikan rating tanpa ulasan tertulis.
                        </p>
                      )
                    )}

                    {admin.selectedTicket.confirmedAt && (
                      <div className="text-[10px] text-slate-400 text-right">
                        Dikonfirmasi pada:{" "}
                        {new Date(
                          admin.selectedTicket.confirmedAt,
                        ).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Waktu Laporan Masuk */}
                <div className="text-[11px] text-slate-500 text-right">
                  Dilaporkan pada:{" "}
                  {admin.selectedTicket.createdAt
                    ? new Date(
                        admin.selectedTicket.createdAt,
                      ).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </div>
              </div>
            )}

            {/* FORM: TERIMA TUGAS */}
            {admin.modalType === "TERIMA" && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 tracking-widest uppercase">
                    Dikerjakan Oleh (Teknisi):
                  </label>
                  <input
                    type="text"
                    disabled={admin.isSubmitting}
                    value={admin.dikerjakanOleh}
                    onChange={(e) => admin.setDikerjakanOleh(e.target.value)}
                    className="w-full bg-white border-2 border-slate-400 px-4 py-2 font-mono text-sm focus:outline-none focus:border-slate-800 disabled:opacity-60"
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
                      disabled={admin.isSubmitting}
                      value={(admin.formSelesai as any)[field]}
                      onChange={(e) =>
                        admin.setFormSelesai({
                          ...admin.formSelesai,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full bg-white border-2 border-slate-400 px-4 py-2 font-mono text-sm min-h-[80px] focus:outline-none focus:border-slate-800 disabled:opacity-60"
                      placeholder={`ISI ${field.toUpperCase()}...`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* FORM: KONFIRMASI BATAL */}
            {admin.modalType === "BATAL" && (
              <div className="space-y-4 mb-6">
                <p className="text-xs text-red-600 font-bold uppercase tracking-widest border-l-2 border-red-600 pl-2">
                  Apakah Anda yakin ingin membatalkan laporan{" "}
                  {admin.selectedTicket.kodeTiket}?
                </p>
              </div>
            )}

            {/* Tombol Eksekusi */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                disabled={admin.isSubmitting}
                onClick={admin.closeModal}
                className="px-6 py-2 bg-slate-300 text-slate-800 font-bold uppercase tracking-widest hover:bg-slate-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                TUTUP
              </button>
              {admin.modalType !== "DETAIL" && (
                <button
                  type="button"
                  disabled={admin.isSubmitting}
                  onClick={admin.handleAction}
                  className="px-6 py-2 bg-slate-800 text-white font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  {admin.isSubmitting ? "EXECUTING..." : "EXECUTE"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}