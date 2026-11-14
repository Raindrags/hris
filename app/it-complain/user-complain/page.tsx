"use client";

import React, { useState } from "react";
import { HistoryList } from "./components/HistoryList";
import { ComplaintForm } from "./components/complain-form";
import { SuccessModal } from "./components/success-modal";
import { useComplaint } from "./hooks/complain";

export default function LayananITPage() {
  const complaintState = useComplaint();

  // State untuk mengontrol Modal Sukses dan menyimpan Ticket ID dari backend
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleFormSubmit = async () => {
    try {
      const response: any = await complaintState.submitComplaint();

      // Jika validasi gagal atau server mengembalikan error, hentikan (biarkan SYSTEM_NOTICE yang tampil)
      if (!response) return;

      // Prioritaskan kodeTiket / tiketkomplain sebelum fallback ke id
      const generatedId =
        response.kodeTiket ||
        response.tiketkomplain ||
        response.data?.tiketkomplain ||
        response.kode ||
        response.data?.kode ||
        complaintState.lastTicketCode ||
        response.id ||
        response.data?.id;

      if (generatedId) {
        setTicketId(generatedId);
        // Tutup SYSTEM_NOTICE agar tidak bertumpuk dengan SuccessModal
        complaintState.setIsModalOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        setTicketId("SYSTEM_ERR_NO_ID");
        complaintState.setIsModalOpen(false);
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Gagal mengirim laporan:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 p-4 md:p-8 font-mono">
      <div className="max-w-5xl mx-auto relative">
        {/* PANEL MECHA UTAMA */}
        <div
          className="relative bg-[#eef1f5] border-2 border-slate-400 p-8 shadow-2xl"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)",
          }}
        >
          {/* DEKORASI HUD SUDUT */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-400"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-400"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-400"></div>
          <div className="absolute top-4 right-1/2 translate-x-1/2 text-[10px] text-slate-400 tracking-[0.2em] font-bold">
            [ 2 - 2 ]
          </div>
          <div className="absolute bottom-4 right-8 text-xs font-bold text-slate-500 tracking-widest flex items-center">
            <span className="w-4 h-[2px] bg-slate-400 mr-2 transform -rotate-45"></span>
            02/05
          </div>

          {/* HEADER TEMA SCI-FI */}
          <div className="flex items-end justify-between mb-10 pb-4 border-b-2 border-slate-300 relative">
            <div className="absolute -bottom-[2px] left-10 w-32 h-[2px] bg-slate-800"></div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-4 bg-slate-800 skew-x-[-20deg]"></div>
                  <div className="w-2 h-4 bg-slate-800 skew-x-[-20deg]"></div>
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-widest uppercase flex items-center">
                  SYS_HELPDESK
                </h1>
              </div>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
                // Portal Manajemen Infrastruktur GA
              </p>
            </div>

            <div className="hidden md:flex flex-col items-end opacity-40">
              <span className="text-[10px] mb-1 font-bold">UPD_</span>
              <div className="w-8 h-4 border border-slate-500"></div>
            </div>
          </div>

          {/* TAB NAVIGASI */}
          <div className="flex space-x-6 mb-8 relative z-10 pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              +
            </span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              +
            </span>

            <button
              onClick={() => complaintState.setActiveTab("form")}
              className={`flex items-center justify-between px-6 py-2 w-48 font-bold text-sm uppercase tracking-wider transition-all border ${
                complaintState.activeTab === "form"
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-transparent text-slate-600 border-slate-400 hover:bg-slate-200"
              }`}
            >
              <span>FORMULIR</span>
              <div
                className={`w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent ${
                  complaintState.activeTab === "form"
                    ? "border-l-white"
                    : "border-l-slate-600"
                }`}
              ></div>
            </button>

            <button
              onClick={() => complaintState.setActiveTab("history")}
              className={`flex items-center justify-between px-6 py-2 w-48 font-bold text-sm uppercase tracking-wider transition-all border ${
                complaintState.activeTab === "history"
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-transparent text-slate-600 border-slate-400 hover:bg-slate-200"
              }`}
            >
              <span>HISTORI</span>
              <div
                className={`w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent ${
                  complaintState.activeTab === "history"
                    ? "border-l-white"
                    : "border-l-slate-600"
                }`}
              ></div>
            </button>
          </div>

          {/* AREA KONTEN */}
          <div className="relative z-10">
            {complaintState.activeTab === "form" ? (
              <ComplaintForm {...complaintState} onSubmit={handleFormSubmit} />
            ) : (
              <HistoryList
                history={complaintState.history}
                onConfirm={complaintState.confirmComplaint}
              />
            )}
          </div>
        </div>
      </div>

      {/* MODAL: SYSTEM NOTICE (Untuk Validasi / Error / Konfirmasi Rating) */}
      {complaintState.isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 font-mono">
          <div
            className="bg-[#eef1f5] border-2 border-slate-800 p-6 max-w-md w-full relative"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div className="flex space-x-1 mb-4">
              <div className="w-1 h-4 bg-red-600 skew-x-[-20deg]"></div>
              <div className="w-1 h-4 bg-red-600 skew-x-[-20deg]"></div>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-widest">
              SYSTEM_NOTICE
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 mt-4 font-bold">
              {complaintState.modalMessage}
            </p>
            <button
              onClick={() => complaintState.setIsModalOpen(false)}
              className="w-full bg-slate-800 text-white font-bold py-3 uppercase tracking-widest hover:bg-slate-700 transition-colors flex justify-between items-center px-4"
            >
              <span>ACKNOWLEDGE</span>
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-white"></div>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: BERHASIL SUBMIT */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        ticketId={ticketId}
      />
    </div>
  );
}