import React from "react";
import { Button } from "@/components/ui/button";
import { ApprovalRequestData } from "../forms/types";

interface ApprovalWarningProps {
  request: ApprovalRequestData;
  onCancel: () => void;
  onProceed: () => void;
}

export function ApprovalWarning({
  request,
  onCancel,
  onProceed,
}: ApprovalWarningProps) {
  const getWarningMessage = () => {
    const combined = `${request.type || ""} ${request.category || ""} ${
      request.subCategory || ""
    }`.toLowerCase();

    if (combined.includes("sakit")) {
      return "Pastikan untuk memeriksa kelengkapan bukti surat dokter dari karyawan jika durasi sakit melebihi 1 hari.";
    }
    if (combined.includes("izin keluar")) {
      return "Periksa kembali apakah sisa jatah batas maksimal izin keluar karyawan ini (maks. 6 jam per bulan) masih tersedia.";
    }
    if (combined.includes("terlambat")) {
      return "Pastikan alasan keterlambatan sudah sesuai dengan batas toleransi waktu yang diizinkan sebelum membebaskan denda.";
    }
    if (combined.includes("pulang awal") || combined.includes("awal pulang")) {
      return "Pastikan alasan pulang awal bersifat mendesak dan sudah dikoordinasikan pekerjaannya dengan tim terkait.";
    }
    if (combined.includes("lupa fp")) {
      return "Validasi terlebih dahulu apakah karyawan benar-benar hadir pada jam tersebut sebelum menyetujui absensi tanpa pemotongan.";
    }
    if (combined.includes("error") && combined.includes("fp")) {
      return "Pastikan memang terdapat laporan kendala teknis pada mesin absensi (Fingerprint) di waktu kejadian tersebut.";
    }

    return "Pastikan alasan izin pribadi karyawan sudah sesuai dengan ketentuan dan peraturan sekolah yang berlaku.";
  };

  return (
    <div className="space-y-4 text-gray-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 bg-orange-950/30 border border-orange-900/60 rounded-md space-y-2">
        <h3 className="text-orange-400 font-bold flex items-center gap-2 text-sm uppercase">
          ⚠️ Peringatan Persetujuan
        </h3>
        <p className="text-sm text-gray-300">{getWarningMessage()}</p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          Batal
        </Button>
        <Button
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={onProceed}
        >
          Lanjutkan Persetujuan
        </Button>
      </div>
    </div>
  );
}
