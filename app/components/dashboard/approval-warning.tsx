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
  const getWarningMessages = (): string[] => {
    const type = (request.type || "").toLowerCase();
    const category = (request.category || "").toLowerCase();
    const subCategory = (request.subCategory || "").toLowerCase();

    const user = request.user;
    const isGuru = user?.isGuru === true || String(user?.isGuru) === "true";
    const divisiName = (user?.divisi?.name || "").toLowerCase();
    const sisaKuota = request.sisaJatahIzinKeluar ?? user?.sisaIzinKeluar;

    const isNoFP = type === "no_fp" || category.includes("nofp");
    const isIzinKhusus = category.includes("khusus");
    const isDinas = category.includes("dinas");
    const isIzinKeluar = category.includes("keluar");
    const isIzin =
      type === "izin" && !isIzinKhusus && !isDinas && !isIzinKeluar;

    let messages: string[] = [];

    // KONDISI 1: NO FP
    if (isNoFP) {
      if (subCategory.includes("error")) {
        messages.push(
          "Dikarenakan terdapat kendala teknis baik secara sengaja / tidak sengaja pada mesin absensi yang menyebabkan error dan terdapat bukti bahwa pegawai tersebut memang ada melakukan absensi, maka pegawai tersebut tetap mendapatkan upah sesuai dengan peraturan kepegawaian.",
        );
      } else if (subCategory.includes("lupa")) {
        messages.push(
          "Pada kategori izin ini, Tunjangan Konsumsi tidak akan dibayarkan dan akan tetap berlaku denda keterlambatan (jika terlambat).",
        );
      }
    }
    // KONDISI 2: IZIN KHUSUS & DINAS
    else if (isIzinKhusus || isDinas) {
      messages.push(
        "Pada kategori izin ini, pegawai tetap mendapat upah sesuai dengan ketentuan kepegawaian.",
      );
    }
    // KONDISI 3: IZIN KELUAR
    else if (isIzinKeluar) {
      if (sisaKuota !== undefined && sisaKuota !== null && sisaKuota > 0) {
        messages.push(
          "Pada kategori izin ini, pegawai tetap mendapat upah sesuai dengan ketentuan kepegawaian.",
        );
      } else {
        messages.push(
          "*Jika melebihi kuota 6 jam, maka tunjangan konsumsi tidak akan dibayarkan.",
        );
      }
    }
    // KONDISI 4: IZIN (Filter berdasarkan Divisi/Role)
    else if (isIzin) {
      if (!isGuru || divisiName.includes("staff")) {
        messages.push(
          "- Jika pegawai mengajukan izin, gaji pokok, tunjangan transport, dan tunjangan konsumsi tidak akan dibayarkan.",
        );
        messages.push(
          "- Jika pegawai mengajukan izin dikarenakan sakit/musibah maka tunjangan transport dan tunjangan konsumsi tidak akan dibayarkan.",
        );
      } else if (divisiName.includes("paud")) {
        messages.push(
          "- Jika pegawai mengajukan izin pada h-7, tunjangan transport dan tunjangan konsumsi tidak akan dibayarkan serta mendapatkan denda shift pegawai sebesar 30.000 /shift.",
        );
        messages.push(
          "- Jika pegawai mengajukan izin kurang dari h-7, gaji pokok, tunjangan transport, dan tunjangan konsumsi tidak akan dibayarkan.",
        );
        messages.push(
          "- Jika pegawai mengajukan izin dikarenakan sakit/musibah maka tunjangan transport dan tunjangan konsumsi tidak akan dibayarkan.",
        );
      } else if (divisiName.includes("sd") || divisiName.includes("smp")) {
        messages.push(
          "- Jika pegawai mengajukan izin pada h-7, tunjangan transport dan tunjangan konsumsi tidak akan dibayarkan serta mendapatkan denda JP pegawai sebesar 5.000 /JP.",
        );
        messages.push(
          "- Jika pegawai mengajukan izin kurang dari h-7, gaji pokok, tunjangan transport, dan tunjangan konsumsi tidak akan dibayarkan.",
        );
        messages.push(
          "- Jika pegawai mengajukan izin dikarenakan sakit/musibah maka tunjangan transport dan tunjangan konsumsi tidak akan dibayarkan.",
        );
      } else if (divisiName.includes("sma")) {
        messages.push(
          "- Jika pegawai mengajukan izin pada h-7 dan izin karena sakit/musibah, tunjangan transport dan tunjangan konsumsi tidak akan dibayarkan serta mendapatkan denda JP pegawai sebesar 5.000 /JP.",
        );
        messages.push(
          "- Jika pegawai mengajukan izin kurang dari h-7, gaji pokok, tunjangan transport, dan tunjangan konsumsi tidak akan dibayarkan.",
        );
      }
    }

    return messages;
  };

  const messages = getWarningMessages();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 text-gray-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 bg-orange-950/30 border border-orange-900/60 rounded-md space-y-3">
        <h3 className="text-orange-400 font-bold flex items-center gap-2 text-sm uppercase">
          ⚠️ Peringatan Persetujuan
        </h3>
        <div className="text-sm text-gray-300 space-y-1.5">
          {messages.map((msg, idx) => (
            <p key={idx} className={msg.startsWith("-") ? "ml-2" : ""}>
              {msg}
            </p>
          ))}
        </div>
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
