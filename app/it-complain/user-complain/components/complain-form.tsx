import React from "react";
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
  isSubmitting?: boolean;
}

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
  isSubmitting = false,
}) => {
  return (
    <div className="space-y-8 font-mono">
      {/* IDENTITAS PELAPOR */}
      <div className="relative border border-slate-300 p-6 bg-white/50">
        <h3 className="text-xs font-black text-slate-800 mb-4 tracking-widest uppercase flex items-center">
          <span className="w-2 h-2 bg-slate-800 inline-block mr-2"></span>
          ID_USER // TERAUTENTIKASI
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">
              NAMA_LENGKAP
            </p>
            <p className="text-sm font-black text-slate-800 uppercase border-b-2 border-slate-800 pb-1">
              {renderString(userIdentity.nama, "MEMUAT...")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">
              NIY_KODE
            </p>
            <p className="text-sm font-black text-slate-800 uppercase border-b-2 border-slate-800 pb-1">
              {renderString(userIdentity.niy, "MEMUAT...")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">
              DIVISI_UNIT
            </p>
            <p className="text-sm font-black text-slate-800 uppercase border-b-2 border-slate-800 pb-1">
              {renderString(userIdentity.divisi, "MEMUAT...")}
            </p>
          </div>
        </div>
      </div>

      {/* RADIO SELECTION GAYA HUD */}
      <div className="flex items-center space-x-6 pt-4 border-t border-slate-300">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          PILIH_MODUL //
        </span>

        <label className="flex items-center space-x-2 cursor-pointer group">
          <div
            className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${formType === "IT" ? "border-slate-800" : "border-slate-400 group-hover:border-slate-600"}`}
          >
            {formType === "IT" && <div className="w-2 h-2 bg-slate-800"></div>}
          </div>
          <input
            type="radio"
            className="hidden"
            disabled={isSubmitting}
            checked={formType === "IT"}
            onChange={() => setFormType("IT")}
          />
          <span
            className={`text-sm font-bold tracking-wider ${formType === "IT" ? "text-slate-800" : "text-slate-500"}`}
          >
            KELUHAN_IT
          </span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer group">
          <div
            className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${formType === "CCTV" ? "border-slate-800" : "border-slate-400 group-hover:border-slate-600"}`}
          >
            {formType === "CCTV" && (
              <div className="w-2 h-2 bg-slate-800"></div>
            )}
          </div>
          <input
            type="radio"
            className="hidden"
            disabled={isSubmitting}
            checked={formType === "CCTV"}
            onChange={() => setFormType("CCTV")}
          />
          <span
            className={`text-sm font-bold tracking-wider ${formType === "CCTV" ? "text-slate-800" : "text-slate-500"}`}
          >
            CEK_CCTV
          </span>
        </label>
      </div>

      {/* FORM DINAMIS */}
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 w-1 h-full bg-slate-300"></div>
        <div className="absolute left-0 top-1/4 w-1 h-1/4 bg-slate-800"></div>

        {formType === "IT" ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                KATEGORI_PERANGKAT <span className="text-red-500">*</span>
              </label>
              <select
                disabled={isSubmitting}
                value={itData.kategori}
                onChange={(e) =>
                  setItData({ ...itData, kategori: e.target.value as any })
                }
                className="w-full bg-white border-2 border-slate-300 p-3 text-slate-800 font-bold text-sm uppercase focus:outline-none focus:border-slate-800 rounded-none appearance-none cursor-pointer disabled:opacity-60"
              >
                <option value="" disabled>
                  -- PILIH OPSI --
                </option>
                <option value="Printer">PRINTER / SCANNER</option>
                <option value="PC/Laptop">PC / LAPTOP</option>
                <option value="Internet">JARINGAN / WIFI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                LOKASI_UNIT <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="CONTOH: RUANG MEETING LT.2"
                value={itData.lokasi}
                onChange={(e) =>
                  setItData({ ...itData, lokasi: e.target.value })
                }
                className="w-full bg-transparent border-b-2 border-slate-300 p-3 text-slate-800 font-bold text-sm uppercase focus:outline-none focus:border-slate-800 rounded-none placeholder-slate-400 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                DESKRIPSI_MASALAH <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                disabled={isSubmitting}
                placeholder="INPUT DATA DIAGNOSTIK..."
                value={itData.masalah}
                onChange={(e) =>
                  setItData({ ...itData, masalah: e.target.value })
                }
                className="w-full bg-white border-2 border-slate-300 p-3 text-slate-800 font-bold text-sm uppercase focus:outline-none focus:border-slate-800 rounded-none resize-none placeholder-slate-400 disabled:opacity-60"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                TITIK_LOKASI_KAMERA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="CONTOH: KORIDOR UTAMA"
                value={cctvData.titikLokasi}
                onChange={(e) =>
                  setCctvData({ ...cctvData, titikLokasi: e.target.value })
                }
                className="w-full bg-transparent border-b-2 border-slate-300 p-3 text-slate-800 font-bold text-sm uppercase focus:outline-none focus:border-slate-800 rounded-none placeholder-slate-400 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  TANGGAL_KEJADIAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  disabled={isSubmitting}
                  value={cctvData.tanggalKejadian || ""}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCctvData({
                      ...cctvData,
                      tanggalKejadian: e.target.value,
                    })
                  }
                  className="w-full bg-white border-2 border-slate-300 p-3 text-slate-800 font-bold text-sm uppercase focus:outline-none focus:border-slate-800 rounded-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  ESTIMASI_WAKTU <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  disabled={isSubmitting}
                  value={cctvData.perkiraanJam}
                  onChange={(e) =>
                    setCctvData({ ...cctvData, perkiraanJam: e.target.value })
                  }
                  className="w-full bg-white border-2 border-slate-300 p-3 text-slate-800 font-bold text-sm uppercase focus:outline-none focus:border-slate-800 rounded-none disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                ALASAN_INVESTIGASI <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                disabled={isSubmitting}
                placeholder="INPUT DATA INVESTIGASI..."
                value={cctvData.masalah}
                onChange={(e) =>
                  setCctvData({ ...cctvData, masalah: e.target.value })
                }
                className="w-full bg-white border-2 border-slate-300 p-3 text-slate-800 font-bold text-sm uppercase focus:outline-none focus:border-slate-800 rounded-none resize-none placeholder-slate-400 disabled:opacity-60"
              />
            </div>
          </div>
        )}

        {/* BUTTON SUBMIT GAYA MECHA (Terkunci otomatis saat isSubmitting) */}
        <div className="mt-10 flex items-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="flex items-center justify-between bg-slate-800 text-white font-black py-4 px-8 w-64 hover:bg-slate-700 transition-colors uppercase tracking-[0.2em] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)",
            }}
          >
            <span>{isSubmitting ? "EXECUTING..." : "EXECUTE"}</span>
            <div className="w-0 h-0 border-t-6 border-b-6 border-l-8 border-transparent border-l-white"></div>
          </button>

          <div className="ml-4 flex space-x-1">
            <div className="w-3 h-8 border-r-4 border-slate-400 transform skew-x-[-20deg]"></div>
            <div className="w-3 h-8 border-r-4 border-slate-400 transform skew-x-[-20deg]"></div>
            <div className="w-3 h-8 border-r-4 border-slate-400 transform skew-x-[-20deg]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};