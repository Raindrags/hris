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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests/${id}/reject`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menolak pengajuan");
    return data;
  };

  const approveRequestApi = async (id: string, payload: any) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests/${id}/approve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
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
      <div className="space-y-4">
        <div className="p-4 bg-slate-900 rounded-lg text-sm mb-4">
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
            className="bg-green-600 hover:bg-green-700"
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
      <form onSubmit={handleProcess} className="space-y-4">
        <Label>Alasan Penolakan (Wajib)</Label>
        <Textarea
          name="rejectionReason"
          placeholder="Kenapa ditolak?"
          required
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActionType(null)}
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
      <form onSubmit={handleProcess} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Anda akan menyetujui Cuti ini. Status akan berubah menjadi Approved
          dan jatah cuti akan dikurangi.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActionType(null)}
          >
            Batal
          </Button>
          <Button type="submit" className="bg-green-600" disabled={loading}>
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
      className="space-y-4 max-h-[60vh] overflow-y-auto px-1"
    >
      <div className="space-y-2">
        <Label>Tugas Diserahkan Kepada</Label>
        <Select value={delegatedTo || ""} onValueChange={setDelegatedTo}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Pegawai Pengganti" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="z-[9999] bg-slate-900 border shadow-md"
          >
            <SelectGroup>
              {filteredSubstitutes.length === 0 ? (
                <SelectItem value="empty" disabled>
                  Tidak ada pegawai pengganti yang tersedia
                </SelectItem>
              ) : (
                filteredSubstitutes.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Rincian Tugas</Label>
        <Textarea
          name="taskDetail"
          placeholder="Apa yang harus dikerjakan pengganti?"
        />
      </div>

      <div className="border-t my-4 border-slate-700" />

      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="no_deduction"
            checked={noDeduction}
            onCheckedChange={(c) => setNoDeduction(c as boolean)}
          />
          <Label htmlFor="no_deduction" className="font-bold text-green-500">
            Tidak Dikenakan Pemotongan
          </Label>
        </div>

        {!noDeduction && (
          <div className="pl-4 space-y-4 border-l-2 border-slate-700">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Jenis Potongan
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_gaji"
                  name="potongGaji"
                  defaultChecked={isIzinPribadi}
                />
                <label htmlFor="p_gaji" className="text-sm">
                  Potong Gaji
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_konsum"
                  name="potongKonsumsi"
                  defaultChecked={isSakit || isIzinPribadi}
                />
                <label htmlFor="p_konsum" className="text-sm">
                  Tunjangan Konsumsi
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="p_trans"
                  name="potongTransport"
                  defaultChecked={isSakit || isIzinPribadi}
                />
                <label htmlFor="p_trans" className="text-sm">
                  Tunjangan Transportasi
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Denda Telat
              </Label>
              <RadioGroup defaultValue="0" name="lateFine">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Jumlah Inval</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    name="invalCount"
                    className="w-16 bg-slate-800"
                    defaultValue={0}
                  />
                  <span className="text-xs text-muted-foreground">
                    x Rp 5.000
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Jumlah Shift</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    name="shiftCount"
                    className="w-16 bg-slate-800"
                    defaultValue={0}
                  />
                  <span className="text-xs text-muted-foreground">
                    x Rp 30.000
                  </span>
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
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          Submit Keputusan
        </Button>
      </div>
    </form>
  );
}
