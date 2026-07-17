// app/components/forms/ApprovalForm.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApprovalForm } from "./hooks/useApprovalForm";
import { ApprovalRequestData, SubstituteUser } from "./types";

interface ApprovalFormProps {
  request: ApprovalRequestData;
  potentialSubstitutes: SubstituteUser[];
  onClose: () => void;
}

export function ApprovalForm({
  request,
  potentialSubstitutes,
  onClose,
}: ApprovalFormProps) {
  const {
    actionType,
    setActionType,
    loading,
    noDeduction,
    setNoDeduction,
    handleProcess,
  } = useApprovalForm(request, potentialSubstitutes, onClose);

  // 1. Tampilan Awal (Belum Memilih Aksi)
  if (!actionType) {
    return (
      <div className="space-y-4 text-gray-200">
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 text-sm mb-4">
          <p>
            <strong>Pengaju:</strong> {request.user.name}{" "}
            {request.user.divisi ? `(${request.user.divisi.name})` : ""}
          </p>
          <p>
            <strong>Tipe:</strong>{" "}
            {request.type === "CUTI"
              ? "Cuti Tahunan"
              : `(${request.user.category || "Izin Umum"})`}
          </p>
          <p>
            <strong>Alasan:</strong> {request.reason}
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

  // 2. Tampilan Form PENOLAKAN
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
          >
            Batal
          </Button>
          <Button type="submit" variant="destructive" disabled={loading}>
            Kirim Penolakan
          </Button>
        </div>
      </form>
    );
  }

  // 3. Tampilan Form PERSETUJUAN (Khusus CUTI)
  if (actionType === "APPROVE" && request.type === "CUTI") {
    return (
      <form onSubmit={handleProcess} className="space-y-4 text-gray-200">
        <p className="text-sm text-gray-400">
          Anda akan menyetujui Cuti ini. Status akan berubah menjadi Approved
          dan jatah cuti akan dikurangi.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActionType(null)}
            className="text-gray-400 hover:text-white"
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
            disabled={loading}
          >
            Konfirmasi Setuju
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleProcess}
      className="space-y-4 max-h-[60vh] overflow-y-auto px-1 text-gray-200"
    >
      <div className="space-y-4 mt-2 p-4 bg-gray-900 border border-gray-800 rounded-md">
        <Label className="text-sm font-semibold uppercase text-gray-400">
          Status Pemotongan
        </Label>
        <RadioGroup
          name="deductionStatus"
          defaultValue={noDeduction ? "no_deduction" : "yes_deduction"}
          onValueChange={(val) => setNoDeduction(val === "no_deduction")}
          className="flex flex-col space-y-3 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no_deduction" id="no_deduction" />
            <Label
              htmlFor="no_deduction"
              className="font-semibold text-emerald-400 cursor-pointer"
            >
              Tidak Dikenakan Pemotongan
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes_deduction" id="yes_deduction" />
            <Label
              htmlFor="yes_deduction"
              className="font-semibold text-red-400 cursor-pointer"
            >
              Dikenakan Potongan
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActionType(null)}
          className="text-gray-400 hover:text-white"
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="bg-crimson-700 hover:bg-crimson-800 text-white shadow-sm shadow-crimson-900/30"
          disabled={loading}
        >
          Submit Keputusan
        </Button>
      </div>
    </form>
  );
}
