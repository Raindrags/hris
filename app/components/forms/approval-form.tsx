// app/components/forms/ApprovalForm.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
    isSakit,
    isIzinPribadi,
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
              : `Izin (${request.user.category || "Umum"})`}
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

  // 4. Tampilan Form PERSETUJUAN (Khusus IZIN - Tanpa Penyerahan Tugas)
  return (
    <form
      onSubmit={handleProcess}
      className="space-y-4 max-h-[60vh] overflow-y-auto px-1 text-gray-200"
    >
      <div className="space-y-4 mt-2">
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="no_deduction"
            checked={noDeduction}
            onCheckedChange={(c) => setNoDeduction(c as boolean)}
          />
          <Label
            htmlFor="no_deduction"
            className="font-semibold text-emerald-400"
          >
            Tidak Dikenakan Pemotongan
          </Label>
        </div>

        {!noDeduction && (
          <div className="pl-4 space-y-4 border-l-2 border-gray-800">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-gray-400">
                Jenis Potongan
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_gaji"
                  name="potongGaji"
                  defaultChecked={isIzinPribadi}
                />
                <label htmlFor="p_gaji" className="text-sm text-gray-300">
                  Potong Gaji
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_konsum"
                  name="potongKonsumsi"
                  defaultChecked={isSakit || isIzinPribadi}
                />
                <label htmlFor="p_konsum" className="text-sm text-gray-300">
                  Tunjangan Konsumsi
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_trans"
                  name="potongTransport"
                  defaultChecked={isSakit || isIzinPribadi}
                />
                <label htmlFor="p_trans" className="text-sm text-gray-300">
                  Tunjangan Transportasi
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-gray-400">
                Denda Telat
              </Label>
              <RadioGroup defaultValue="0" name="lateFine">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="t_0" />
                  <Label htmlFor="t_0" className="text-gray-300">
                    Tidak ada
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5000" id="t_5000" />
                  <Label htmlFor="t_5000" className="text-gray-300">
                    Rp 5.000
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10000" id="t_10000" />
                  <Label htmlFor="t_10000" className="text-gray-300">
                    Rp 10.000
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Jumlah Inval</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    name="invalCount"
                    className="w-16 bg-gray-900 border-gray-700 text-gray-200"
                    defaultValue={0}
                  />
                  <span className="text-xs text-gray-500">x Rp 5.000</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Jumlah Shift</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    name="shiftCount"
                    className="w-16 bg-gray-900 border-gray-700 text-gray-200"
                    defaultValue={0}
                  />
                  <span className="text-xs text-gray-500">x Rp 30.000</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
