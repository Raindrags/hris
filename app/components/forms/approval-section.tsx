"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export interface ApprovalRequestData {
  id: string;
  type: "CUTI" | "IZIN";
  reason?: string;
  startDate: Date | string;
  endDate: Date | string;
  attachmentUrl?: string | null;
  user: {
    id: string;
    name: string;
    divisi?: { id: string; name: string } | null;
    category?: string;
  };
}

interface ApprovalFormProps {
  request: ApprovalRequestData;
  onClose: () => void;
}

export function ApprovalForm({ request, onClose }: ApprovalFormProps) {
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Kategori pengecekan untuk Auto-Centang potongan
  const categoryStr = request.user.category?.toLowerCase() || "";
  const isDinasOrKhusus =
    categoryStr.includes("dinas") || categoryStr.includes("izinkhusus");
  const isSakit = categoryStr.includes("sakit");
  const isIzinPribadi = !isDinasOrKhusus && !isSakit;

  const [noDeduction, setNoDeduction] = useState<boolean>(isDinasOrKhusus);

  const handleProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("accessToken");

    try {
      if (actionType === "REJECT") {
        const reason = formData.get("rejectionReason") as string;
        const res = await fetch(`/api/requests/${request.id}/reject`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        });
        if (!res.ok)
          throw new Error(
            (await res.json()).message || "Gagal menolak pengajuan",
          );
        toast.info("Pengajuan ditolak.");
      } else if (actionType === "APPROVE") {
        // Payload bersih karena delegasi sudah dipindah ke user
        const payload: any = { deductions: [] as string[] };

        if (!noDeduction) {
          if (formData.get("potongGaji")) payload.deductions.push("Gaji");
          if (formData.get("potongKonsumsi"))
            payload.deductions.push("Tunjangan Konsumsi");
          if (formData.get("potongTransport"))
            payload.deductions.push("Tunjangan Transportasi");
        }

        // Siap untuk fitur HR berikutnya (Fine/Inval)
        // payload.lateFine = formData.get("lateFine") as string | null;

        const res = await fetch(`/api/requests/${request.id}/approve`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok)
          throw new Error(
            (await res.json()).message || "Gagal menyetujui pengajuan",
          );
        toast.success("Pengajuan disetujui.");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER 1: PEMILIHAN AKSI UTAMA ---
  if (!actionType) {
    return (
      <div className="space-y-4 text-gray-200">
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 text-sm">
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

  // --- RENDER 2: FORM PENOLAKAN ---
  if (actionType === "REJECT") {
    return (
      <form onSubmit={handleProcess} className="space-y-4 text-gray-200">
        <div className="space-y-2">
          <Label className="text-gray-300">Alasan Penolakan (Wajib)</Label>
          <Textarea
            name="rejectionReason"
            placeholder="Berikan alasan mengapa pengajuan ditolak..."
            required
            className="bg-gray-900 border-gray-700 focus:border-red-700 text-gray-200"
          />
        </div>
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{" "}
            Kirim Penolakan
          </Button>
        </div>
      </form>
    );
  }

  // --- RENDER 3: FORM PERSETUJUAN (CUTI NORMAL) ---
  if (actionType === "APPROVE" && request.type === "CUTI") {
    return (
      <form onSubmit={handleProcess} className="space-y-4 text-gray-200">
        <p className="text-sm text-gray-400 p-3 bg-gray-900 rounded border border-gray-800">
          Tindakan ini akan menyetujui Cuti. Status akan berubah menjadi{" "}
          <b>Approved</b> dan jatah sisa cuti tahunan pegawai akan langsung
          dikurangi.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActionType(null)}
            className="text-gray-400"
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

  // --- RENDER 4: FORM PERSETUJUAN (IZIN DENGAN PENYESUAIAN POTONGAN) ---
  return (
    <form
      onSubmit={handleProcess}
      className="space-y-5 max-h-[60vh] overflow-y-auto px-1 text-gray-200"
    >
      <div className="bg-gray-900 p-3 rounded border border-gray-800">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="no_deduction"
            checked={noDeduction}
            onCheckedChange={(c) => setNoDeduction(c as boolean)}
          />
          <Label
            htmlFor="no_deduction"
            className="font-semibold text-emerald-400 cursor-pointer"
          >
            Tidak Dikenakan Pemotongan / Denda
          </Label>
        </div>
      </div>

      {!noDeduction && (
        <div className="p-4 space-y-5 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
              Jenis Potongan Tunjangan
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_gaji"
                  name="potongGaji"
                  defaultChecked={isIzinPribadi}
                />{" "}
                <label htmlFor="p_gaji" className="text-sm">
                  Potong Gaji
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_konsum"
                  name="potongKonsumsi"
                  defaultChecked={isSakit || isIzinPribadi}
                />{" "}
                <label htmlFor="p_konsum" className="text-sm">
                  Tunjangan Konsumsi
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_trans"
                  name="potongTransport"
                  defaultChecked={isSakit || isIzinPribadi}
                />{" "}
                <label htmlFor="p_trans" className="text-sm">
                  Tunjangan Transportasi
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800" />

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
              Sanksi Keterlambatan
            </Label>
            <RadioGroup defaultValue="0" name="lateFine" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="t_0" />
                <Label htmlFor="t_0">Tidak ada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5000" id="t_5000" />
                <Label htmlFor="t_5000">Rp 5.000</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10000" id="t_10000" />
                <Label htmlFor="t_10000">Rp 10.000</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Jumlah Inval</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  name="invalCount"
                  className="w-20 bg-gray-950 border-gray-700"
                  defaultValue={0}
                />
                <span className="text-xs text-gray-500">x Rp 5K</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Jumlah Shift</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  name="shiftCount"
                  className="w-20 bg-gray-950 border-gray-700"
                  defaultValue={0}
                />
                <span className="text-xs text-gray-500">x Rp 30K</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
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
          className="bg-crimson-700 hover:bg-crimson-800 text-white"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{" "}
          Submit Keputusan
        </Button>
      </div>
    </form>
  );
}
