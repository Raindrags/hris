"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useApprovalForm } from "./hooks/useApprovalForm";
import { ApprovalRequestData, SubstituteUser } from "./types";
import { DeductionModal } from "../dashboard/deductions-modal";
import { ApprovalWarning } from "../dashboard/approval-warning";

interface ApprovalFormProps {
  request: ApprovalRequestData;
  potentialSubstitutes: SubstituteUser[];
  onClose: () => void;
}

const formatDate = (dateString?: string | Date) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function ApprovalForm({
  request,
  potentialSubstitutes,
  onClose,
}: ApprovalFormProps) {
  const { actionType, setActionType, loading, handleProcess } = useApprovalForm(
    request,
    potentialSubstitutes,
    onClose,
  );

  const [warningAccepted, setWarningAccepted] = useState(false);

  useEffect(() => {
    if (!actionType) {
      setWarningAccepted(false);
    }
  }, [actionType]);

  const categoryStr = request.category?.toLowerCase() || "";
  const isIzinKhusus = categoryStr.includes("izin khusus");
  const isIzinDinas = categoryStr.includes("dinas");
  const isIzinKeluar = categoryStr.includes("izinkeluar");
  const isSakit = categoryStr.includes("sakit");
  const isNoFP = categoryStr.includes("nofp") || request.type === "NO_FP";

  const isGuru =
    request.user?.isGuru === true || String(request.user?.isGuru) === "true";
  const sisaKuota = request.sisaJatahIzinKeluar ?? request.user?.sisaIzinKeluar;
  // Kondisi memunculkan popup peringatan (Kecuali Cuti, Izin Khusus, Izin Dinas)
  const needsWarning = !isIzinKhusus && !isIzinDinas && request.type !== "CUTI";

  if (!actionType) {
    let currentDuration = request.durationHours || 0;

    // Jika durasi dari backend 0, hitung manual dari time dan returnTime
    if (
      currentDuration === 0 &&
      isIzinKeluar &&
      request.time &&
      request.returnTime
    ) {
      const [startH, startM] = request.time.split(":").map(Number);
      const [endH, endM] = request.returnTime.split(":").map(Number);
      if (!isNaN(startH) && !isNaN(endH)) {
        const diffMins = endH * 60 + endM - (startH * 60 + startM);
        if (diffMins > 0) {
          // Bulatkan 1 angka di belakang koma (contoh: 1.5 Jam)
          currentDuration = Math.round((diffMins / 60) * 10) / 10;
        }
      }
    }

    return (
      <div className="space-y-4 text-gray-200">
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 text-sm mb-4 space-y-1.5">
          <p>
            <strong>Pengaju:</strong> {request.user?.name || "-"}{" "}
            {request.user?.divisi ? `(${request.user.divisi.name})` : ""}
          </p>
          <p>
            <strong>Tipe:</strong>{" "}
            {request.type === "CUTI"
              ? "Cuti Tahunan"
              : `(${request.category || "Izin Umum"})`}
          </p>

          <p>
            <strong>Tanggal:</strong> {formatDate(request.startDate)}
            {request.endDate &&
              request.startDate !== request.endDate &&
              ` s/d ${formatDate(request.endDate)}`}
          </p>

          {request.durationDays && !isNoFP && (
            <p>
              <strong>Durasi:</strong> {request.durationDays} Hari
            </p>
          )}

          {request.type === "CUTI" && (
            <p className="text-emerald-400 font-medium">
              <strong>Sisa Cuti:</strong>{" "}
              {request.user?.sisaCuti !== undefined &&
              request.user?.sisaCuti !== null
                ? `${request.user.sisaCuti} Hari`
                : "Data sisa cuti tidak tersedia"}
            </p>
          )}

          {isIzinKhusus && request.subCategory && (
            <p>
              <strong>Kategori Izin Khusus:</strong> {request.subCategory}
            </p>
          )}

          {isNoFP && request.subCategory && (
            <p>
              <strong>Tipe No FP:</strong> {request.subCategory}
            </p>
          )}

          {isNoFP && (
            <p>
              <strong>Status Lupa FP:</strong>{" "}
              {request.fpDatang && request.fpPulang
                ? "FP Datang & FP Pulang"
                : request.fpDatang
                  ? "FP Datang"
                  : request.fpPulang
                    ? "FP Pulang"
                    : "-"}
            </p>
          )}

          {isSakit && (request.durationDays ?? 0) > 1 && (
            <p>
              <strong>Surat Dokter:</strong>{" "}
              {request.suratDokter === true ||
              request.suratDokter === "true" ? (
                <span className="text-emerald-400 font-medium">Terlampir</span>
              ) : (
                <span className="text-rose-400 font-medium">
                  Tidak Terlampir
                </span>
              )}
            </p>
          )}

          {isIzinKeluar && (
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700 mt-2">
              <p>
                <strong>Waktu Keluar:</strong> {request.time || "-"} s/d{" "}
                {request.returnTime || "-"}
              </p>
              <p>
                <strong>Durasi Izin Ini:</strong> {currentDuration} Jam
              </p>

              {/* 2. Gunakan isGuru untuk memisahkan UI Guru dan Staff */}
              {isGuru ? (
                sisaKuota !== undefined && sisaKuota !== null ? (
                  <p
                    className={
                      sisaKuota < 0
                        ? "text-red-400 font-semibold"
                        : "text-emerald-400"
                    }
                  >
                    <strong>Sisa Jatah Anda:</strong>{" "}
                    {sisaKuota > 0
                      ? `${sisaKuota} Jam`
                      : "Habis/Melebihi Jatah"}
                    <span className="text-gray-400 font-normal text-xs ml-1 block mt-1">
                      *Batas maksimal izin keluar adalah 6 jam per bulan.
                    </span>
                  </p>
                ) : (
                  <p className="text-yellow-500 text-xs italic mt-2">
                    *Data sisa jatah gagal dimuat dari server.
                  </p>
                )
              ) : (
                <p className="text-yellow-500 text-xs italic mt-2">
                  * Kuota izin keluar tidak tersedia untuk staff (Non-Guru).
                </p>
              )}
            </div>
          )}

          {!isIzinKeluar &&
            (request.startTime || request.endTime || request.time) && (
              <p>
                <strong>Waktu:</strong> {request.startTime || request.time}{" "}
                {request.endTime || request.returnTime
                  ? `- ${request.endTime || request.returnTime}`
                  : ""}
              </p>
            )}

          <p>
            <strong>Alasan:</strong> {request.reason || "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="destructive" onClick={() => setActionType("REJECT")}>
            Tolak
          </Button>
          <Button
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={() => setActionType("APPROVE")}
          >
            Setujui
          </Button>
        </div>
      </div>
    );
  }

  if (actionType === "REJECT") {
    return (
      <form onSubmit={handleProcess} className="space-y-4 text-gray-200">
        <Label className="text-gray-300">Alasan Penolakan (Wajib)</Label>
        <Textarea
          name="rejectionReason"
          placeholder="Kenapa ditolak?"
          required
          className="bg-gray-900 border-gray-700 focus:border-red-700 text-gray-200 placeholder:text-gray-500"
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActionType(null)}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" variant="destructive" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Kirim Penolakan
          </Button>
        </div>
      </form>
    );
  }

  if (actionType === "APPROVE" && request.type === "CUTI") {
    return (
      <form onSubmit={handleProcess} className="space-y-4 text-gray-200">
        <div className="p-3 bg-gray-900 border border-gray-800 rounded-md">
          <p className="text-sm text-gray-300">
            Anda akan menyetujui Cuti ini. Status akan berubah menjadi{" "}
            <strong>Approved</strong>.
          </p>
          <p className="text-sm text-yellow-500 mt-1">
            ⚠️ Sisa cuti pengaju ({request.user?.sisaCuti ?? "?"} Hari) akan
            otomatis dikurangi oleh sistem.
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActionType(null)}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Konfirmasi Setuju
          </Button>
        </div>
      </form>
    );
  }

  if (actionType === "APPROVE" && request.type !== "CUTI") {
    // Gunakan komponen ApprovalWarning baru
    if (needsWarning && !warningAccepted) {
      return (
        <ApprovalWarning
          request={request}
          onCancel={() => setActionType(null)}
          onProceed={() => setWarningAccepted(true)}
        />
      );
    }

    return (
      <DeductionModal
        isOpen={true}
        onClose={() => setActionType(null)}
        request={request}
        onSuccess={onClose}
        source="approval"
      />
    );
  }

  return null;
}
