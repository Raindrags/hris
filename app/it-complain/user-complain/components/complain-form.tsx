import React from "react";
import {
  Video,
  Monitor,
  AlertCircle,
  Send,
  User,
  BadgeInfo,
  Briefcase,
} from "lucide-react";
import {
  CCTVComplaintData,
  ComplaintType,
  ITComplaintData,
  UserIdentity,
} from "../type";

interface FormProps {
  formType: ComplaintType;
  setFormType: (type: ComplaintType) => void;
  userIdentity: UserIdentity;
  itData: ITComplaintData;
  setItData: React.Dispatch<React.SetStateAction<ITComplaintData>>;
  cctvData: CCTVComplaintData;
  setCctvData: React.Dispatch<React.SetStateAction<CCTVComplaintData>>;
  onSubmit: () => void;
}

// Helper untuk memastikan yang dirender selalu string
const renderString = (val: any, fallback: string) => {
  if (!val) return fallback;
  if (typeof val === "object") return val.name || val.nama || fallback;
  return String(val);
};

export const ComplaintForm: React.FC<FormProps> = ({
  formType,
  setFormType,
  userIdentity,
  itData,
  setItData,
  cctvData,
  setCctvData,
  onSubmit,
}) => {
  return (
    <div className="space-y-6">
      {/* Identitas User (Read-Only) */}
      <div className="bg-slate-900/60 p-6 rounded-xl border border-cyan-800/50 shadow-[0_0_15px_rgba(8,112,184,0.1)] backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" /> Identitas Pelapor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box Nama Lengkap */}
          <div className="bg-[#0b1329] border border-slate-700/60 rounded-lg px-4 py-3 flex items-center">
            <User className="w-4 h-4 text-slate-500 mr-3" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Nama Lengkap</p>
              <p className="text-sm font-medium text-slate-200">
                {renderString(userIdentity.nama, "Memuat...")}
              </p>
            </div>
          </div>

          {/* Box NIY */}
          <div className="bg-[#0b1329] border border-slate-700/60 rounded-lg px-4 py-3 flex items-center">
            <BadgeInfo className="w-4 h-4 text-slate-500 mr-3" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">NIY</p>
              <p className="text-sm font-medium text-slate-200 font-mono">
                {renderString(userIdentity.niy, "Memuat...")}
              </p>
            </div>
          </div>

          {/* Box Divisi */}
          <div className="bg-[#0b1329] border border-slate-700/60 rounded-lg px-4 py-3 flex items-center">
            <Briefcase className="w-4 h-4 text-slate-500 mr-3" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Divisi</p>
              <p className="text-sm font-medium text-slate-200">
                {renderString(userIdentity.divisi, "Memuat...")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 mb-6">
        <button
          onClick={() => setFormType("IT")}
          className={`flex items-center px-6 py-3 font-medium text-sm transition-all ${formType === "IT" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30" : "text-slate-500 hover:text-slate-300"}`}
        >
          <Monitor className="w-4 h-4 mr-2" /> Keluhan IT
        </button>
        <button
          onClick={() => setFormType("CCTV")}
          className={`flex items-center px-6 py-3 font-medium text-sm transition-all ${formType === "CCTV" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30" : "text-slate-500 hover:text-slate-300"}`}
        >
          <Video className="w-4 h-4 mr-2" /> Pengecekan CCTV
        </button>
      </div>

      {/* Dynamic Form Area */}
      <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800/80">
        {formType === "IT" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Kategori Masalah
              </label>
              <select
                value={itData.kategori}
                onChange={(e) =>
                  setItData({ ...itData, kategori: e.target.value as any })
                }
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="" disabled>
                  -- Pilih Perangkat --
                </option>
                <option value="Printer">Printer / Scanner</option>
                <option value="PC/Laptop">PC / Laptop</option>
                <option value="Internet">Jaringan Internet / WiFi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Lokasi Perangkat
              </label>
              <input
                type="text"
                placeholder="Contoh: Ruang Meeting Lantai 2"
                value={itData.lokasi}
                onChange={(e) =>
                  setItData({ ...itData, lokasi: e.target.value })
                }
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Detail Masalah
              </label>
              <textarea
                rows={4}
                placeholder="Jelaskan kendala secara spesifik..."
                value={itData.masalah}
                onChange={(e) =>
                  setItData({ ...itData, masalah: e.target.value })
                }
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Titik Lokasi CCTV
              </label>
              <input
                type="text"
                placeholder="Contoh: Koridor Utama Gedung A, Area Parkir"
                value={cctvData.titikLokasi}
                onChange={(e) =>
                  setCctvData({ ...cctvData, titikLokasi: e.target.value })
                }
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Perkiraan Jam Kejadian
              </label>
              <input
                type="time"
                value={cctvData.perkiraanJam}
                onChange={(e) =>
                  setCctvData({ ...cctvData, perkiraanJam: e.target.value })
                }
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Masalah / Alasan Pengecekan
              </label>
              <textarea
                rows={4}
                placeholder="Contoh: Barang hilang, pengecekan absensi..."
                value={cctvData.masalah}
                onChange={(e) =>
                  setCctvData({ ...cctvData, masalah: e.target.value })
                }
                className="w-full bg-[#0b1329] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
        )}

        <button
          onClick={onSubmit}
          className="mt-6 w-full flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold py-3.5 px-6 rounded-lg shadow-[0_0_20px_rgba(8,112,184,0.3)] transition-all transform hover:scale-[1.01]"
        >
          <Send className="w-4 h-4 mr-2" /> Submit Pengajuan
        </button>
      </div>
    </div>
  );
};
