"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface SubstituteUser {
  id: string;
  name: string;
  divisi?: { id: string; name: string } | null;
}

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
  potentialSubstitutes: SubstituteUser[];
  onClose: () => void;
}

export function ApprovalForm({
  request,
  potentialSubstitutes,
  onClose,
}: ApprovalFormProps) {
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  const categoryStr = request.user.category?.toLowerCase() || "";
  const isDinasOrKhusus =
    categoryStr.includes("dinas") || categoryStr.includes("izinkhusus");
  const isSakit = categoryStr.includes("sakit");
  const isIzinPribadi = !isDinasOrKhusus && !isSakit;

  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [noDeduction, setNoDeduction] = useState<boolean>(isDinasOrKhusus);

  const filteredSubstitutes = potentialSubstitutes.filter((sub) => {
    if (!request.user?.divisi?.id || !sub.divisi?.id) return false;
    return sub.divisi.id === request.user.divisi.id;
  });

  const rejectRequestApi = async (id: string, reason: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/requests/${id}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menolak pengajuan");
    return data;
  };

  const approveRequestApi = async (id: string, payload: any) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/requests/${id}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menyetujui pengajuan");
    return data;
  };

  const handleProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (actionType === "REJECT") {
        const reason = formData.get("rejectionReason") as string;
        await rejectRequestApi(request.id, reason);
        toast.info("Pengajuan ditolak.");
      } else if (actionType === "APPROVE") {
        // Payload minimal yang didukung backend saat ini
        const payload: any = {
          delegatedToId: delegatedTo || undefined,
          taskDetail: (formData.get("taskDetail") as string) || undefined,
          deductions: [] as string[],
        };

        if (!noDeduction) {
          if (formData.get("potongGaji")) payload.deductions.push("Gaji");
          if (formData.get("potongKonsumsi"))
            payload.deductions.push("Tunjangan Konsumsi");
          if (formData.get("potongTransport"))
            payload.deductions.push("Tunjangan Transportasi");
        }

        // Field tambahan yang akan dikirim setelah backend diperluas:
        // payload.lateFine = formData.get("lateFine") as string | null;
        // payload.invalCount = formData.get("invalCount") as string | null;
        // payload.shiftCount = formData.get("shiftCount") as string | null;

        await approveRequestApi(request.id, payload);
        toast.success("Pengajuan disetujui.");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

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

  // Tampilan APPROVE untuk IZIN (kompleks)
  return (
    <form
      onSubmit={handleProcess}
      className="space-y-4 max-h-[60vh] overflow-y-auto px-1 text-gray-200"
    >
      <div className="space-y-2">
        <Label className="text-gray-300">Tugas Diserahkan Kepada</Label>
        <Select
          value={delegatedTo || ""}
          onValueChange={(value) => setDelegatedTo(value ?? "")}
        >
          <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
            <SelectValue placeholder="Pilih Pegawai Pengganti" />
          </SelectTrigger>
          <SelectContent className="z-[9999] bg-gray-900 border-gray-700 shadow-xl">
            <SelectGroup>
              {filteredSubstitutes.length === 0 ? (
                <SelectItem value="empty" disabled className="text-gray-500">
                  Tidak ada pegawai pengganti yang tersedia
                </SelectItem>
              ) : (
                filteredSubstitutes.map((sub) => (
                  <SelectItem
                    key={sub.id}
                    value={sub.id}
                    className="text-gray-200 focus:bg-crimson-900/40 focus:text-white"
                  >
                    {sub.name}
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Rincian Tugas</Label>
        <Textarea
          name="taskDetail"
          placeholder="Apa yang harus dikerjakan pengganti?"
          className="bg-gray-900 border-gray-700 focus:border-crimson-700 text-gray-200 placeholder:text-gray-500"
        />
      </div>

      <div className="border-t my-4 border-gray-800" />

      <div className="space-y-4">
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
