"use client";

import React from "react";
import { HistoryList } from "./components/HistoryList";
import { ShieldAlert, Server, Cpu, X } from "lucide-react";
import { useComplaint } from "./hooks/complain";
import { ComplaintForm } from "./components/complain-form";

export default function LayananITPage() {
  const complaintState = useComplaint();

  return (
    // Background Dark Blue Futuristic (Sesuai tema GA Super App)
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto relative">
        {/* Ornamen Glow Latar */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-full md:w-3/4 h-32 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/80">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center">
              <ShieldAlert className="w-8 h-8 mr-3 text-cyan-400" />
              IT Helpdesk & CCTV
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Portal Manajemen Infrastruktur - GA Super App
            </p>
          </div>
          <div className="hidden md:flex space-x-4 opacity-20">
            <Server className="w-8 h-8 text-cyan-400" />
            <Cpu className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Tab Navigasi Utama */}
        <div className="flex space-x-3 mb-8 relative z-10">
          <button
            onClick={() => complaintState.setActiveTab("form")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${complaintState.activeTab === "form" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800 shadow-[0_0_15px_rgba(8,112,184,0.2)]" : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-transparent"}`}
          >
            Formulir Laporan
          </button>
          <button
            onClick={() => complaintState.setActiveTab("history")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${complaintState.activeTab === "history" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800 shadow-[0_0_15px_rgba(8,112,184,0.2)]" : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-transparent"}`}
          >
            Histori ({complaintState.history.length})
          </button>
        </div>

        {/* Render Komponen Berdasarkan Tab */}
        <div className="relative z-10">
          {complaintState.activeTab === "form" ? (
            <ComplaintForm
              {...complaintState}
              onSubmit={complaintState.submitComplaint}
            />
          ) : (
            <HistoryList history={complaintState.history} />
          )}
        </div>
      </div>

      {/* Custom Modal (Pengganti alert bawaan browser) */}
      {complaintState.isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0b1329] border border-cyan-800/60 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(8,112,184,0.2)] relative">
            <button
              onClick={() => complaintState.setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-cyan-400" /> System
              Notice
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6 mt-4">
              {complaintState.modalMessage}
            </p>
            <button
              onClick={() => complaintState.setIsModalOpen(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium py-2.5 rounded-lg border border-cyan-900 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
