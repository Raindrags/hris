import React from "react";
import { MessageSquare, CheckSquare } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string; // <-- Menambahkan props ticketId dari backend
}

const WHATSAPP_NUMBER = "6282276090312";

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  ticketId,
}) => {
  if (!isOpen) return null;

  // Setup Pesan Template WhatsApp menggunakan ticketId dari props
  const waMessage = `Halo IT Support, saya ingin melampirkan foto/video kerusakan untuk nomor laporan: *${ticketId}*`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 font-mono">
      <div
        className="bg-[#eef1f5] border-2 border-slate-800 p-8 max-w-lg w-full relative shadow-2xl"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%, 0 25px)",
        }}
      >
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-600"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-400"></div>
        <div className="absolute top-6 right-8 text-[10px] font-black tracking-widest text-emerald-600">
          [ STATUS: OK ]
        </div>

        <div className="flex items-center space-x-3 mb-6 border-b-2 border-slate-300 pb-4">
          <div className="flex space-x-1">
            <div className="w-2 h-6 bg-emerald-600 skew-x-[-20deg]"></div>
            <div className="w-2 h-6 bg-emerald-600 skew-x-[-20deg]"></div>
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center">
            <CheckSquare className="w-6 h-6 mr-3 text-emerald-600" />
            TRANSMISI_BERHASIL
          </h3>
        </div>

        <div className="space-y-6">
          <p className="text-slate-600 text-sm font-bold uppercase tracking-wide">
            Data laporan Anda telah direkam ke dalam sistem. Berikut adalah
            identitas tiket Anda:
          </p>

          {/* Kotak Nomor Tiket */}
          <div className="bg-white border-2 border-slate-400 p-4 text-center relative group">
            <div className="absolute left-0 top-0 w-2 h-full bg-slate-800"></div>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">
              UNIQUE_REPORT_ID //
            </p>
            <p className="text-3xl font-black text-slate-800 tracking-[0.15em]">
              {ticketId || "MEMUAT..."}
            </p>
          </div>

          <div className="bg-slate-200/50 border border-slate-300 p-4 relative">
            <p className="text-xs text-slate-700 font-bold leading-relaxed mb-4">
              <span className="text-amber-600 font-black">
                ACTION_REQUIRED:
              </span>{" "}
              Jika Anda perlu melampirkan foto atau video bukti kerusakan,
              silakan teruskan ID Tiket ini melalui saluran komunikasi WhatsApp
              kami.
            </p>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-emerald-600 text-white font-black py-3 px-6 hover:bg-emerald-700 transition-colors uppercase tracking-widest w-full text-sm"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
            >
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-3" />
                LAMPIRKAN FOTO (VIA WA)
              </span>
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-white"></div>
            </a>
          </div>
        </div>

        {/* Tombol Tutup */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center text-xs font-black bg-slate-800 text-white py-2 px-6 uppercase tracking-widest hover:bg-slate-700"
          >
            <span>TUTUP PANEL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
