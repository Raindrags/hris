"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface DeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any | null;
  onSuccess: () => void;
  source?: "approval" | "history";
}

export function DeductionModal({
  isOpen,
  onClose,
  request,
  onSuccess,
  source = "history",
}: DeductionModalProps) {
  const [deductionType, setDeductionType] = useState<
    "TIDAK_DIPOTONG" | "DIPOTONG" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State baru untuk Rekomendasi Atasan & Sinkronisasi Ceklis Potong Gaji
  const [rekomendasi, setRekomendasi] = useState<string | null>(null);
  const [isPotongGaji, setIsPotongGaji] = useState<boolean>(false);

  const combinedType =
    `${request?.type || ""} ${request?.category || ""} ${request?.subCategory || ""}`.toLowerCase();

  const hideNoDeduction =
    combinedType.includes("izin") ||
    combinedType.includes("sakit") ||
    combinedType.includes("lupa fp");

  // Deteksi Sakit > 1 Hari Tanpa Surat Dokter
  const isSakitTanpaSurat =
    combinedType.includes("sakit") &&
    request?.durationDays > 1 &&
    !request?.suratDokter &&
    !request?.attachmentUrl;

  useEffect(() => {
    if (request) {
      if (hideNoDeduction) {
        setDeductionType("DIPOTONG");
      } else {
        setDeductionType(
          request.deductionOptions === "TIDAK_DIPOTONG"
            ? "TIDAK_DIPOTONG"
            : "DIPOTONG",
        );
      }
      setIsPotongGaji(request.potongGaji || false);
      setRekomendasi(request.rekomendasiAtasan || null);
    }
  }, [request, isOpen, hideNoDeduction]);

  // Fungsi trigger saat rekomendasi diklik
  const handleRekomendasiChange = (opsi: string) => {
    if (rekomendasi === opsi) {
      setRekomendasi(null); // Batal pilih
    } else {
      setRekomendasi(opsi);
      setDeductionType("DIPOTONG"); // Otomatis aktifkan pemotongan
      setIsPotongGaji(true); // Otomatis ceklis Potong Gaji
    }
  };

  const handleSubmitDeduction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!request) return;

    if (!deductionType) {
      toast.error("Silakan pilih status pemotongan terlebih dahulu");
      return;
    }

    if (isSakitTanpaSurat && !rekomendasi) {
      toast.error(
        "Silakan pilih rekomendasi atasan untuk sakit tanpa surat dokter",
      );
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    const noDeduction = deductionType === "TIDAK_DIPOTONG";

    // PERBAIKAN: Buat URL dinamis berdasarkan source
    const endpointUrl =
      source === "approval"
        ? `/api/requests/${request.id}/approve`
        : `/api/requests/${request.id}/deductions`;

    try {
      const res = await fetch(endpointUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noDeduction, source, ...payload }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyimpan data denda");
      }

      // PERBAIKAN: Notifikasi sukses menjadi dinamis
      toast.success(
        source === "approval"
          ? "Pengajuan disetujui & denda berhasil disimpan"
          : "Denda dan potongan berhasil diperbarui",
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Terjadi kesalahan pada server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-gray-200 sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-white text-lg">
              Tindak Lanjut Pemotongan
            </DialogTitle>
            <span className="text-xs text-orange-400 font-bold">
              *Harap Pastikan Sesuai Dengan Peraturan Kepegawaian yang Berlaku
            </span>
          </div>
          <DialogDescription className="text-gray-400">
            <span className="font-semibold text-gray-300">
              {request?.user?.name}
            </span>{" "}
            - {request?.category || request?.type}
            {request?.subCategory ? ` (${request?.subCategory})` : ""}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmitDeduction}
          className="space-y-5 max-h-[65vh] overflow-y-auto px-1 mt-2 
                     [&::-webkit-scrollbar]:w-2 
                     [&::-webkit-scrollbar-track]:bg-gray-900 
                     [&::-webkit-scrollbar-thumb]:bg-gray-700 
                     [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {/* FITUR BARU: Alert Rekomendasi Sakit Tanpa Surat */}
          {isSakitTanpaSurat && (
            <div className="bg-rose-950/40 p-4 rounded-lg border border-rose-900/60 space-y-3">
              <Label className="text-rose-400 font-bold text-sm uppercase">
                ⚠️ Sakit &gt; 1 Hari Tanpa Surat Dokter
              </Label>
              <div className="space-y-2 pt-1 border-t border-rose-900/40">
                <p className="text-xs text-gray-400 mb-2">
                  Pilih Rekomendasi Atasan:
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rek_potong"
                      checked={rekomendasi === "Potong Gaji Penuh"}
                      onCheckedChange={() =>
                        handleRekomendasiChange("Potong Gaji Penuh")
                      }
                    />
                    <Label
                      htmlFor="rek_potong"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Sesuai Peraturan (Potong Gaji Penuh)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rek_lainnya"
                      checked={rekomendasi === "Lainnya"}
                      onCheckedChange={() => handleRekomendasiChange("Lainnya")}
                    />
                    <Label
                      htmlFor="rek_lainnya"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Rekomendasi atasan atas izin sakit tanpa surat dokter
                    </Label>
                  </div>
                </div>

                {/* Input Teks Alasan muncul jika rekomendasi dipilih */}
                {rekomendasi && (
                  <div className="pt-3 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-xs text-gray-400">
                      Alasan Rekomendasi (Wajib)
                    </Label>
                    <Textarea
                      name="alasanRekomendasi"
                      required
                      placeholder="Ketik alasan rekomendasi..."
                      className="mt-1 bg-gray-900/80 border-rose-900/50 text-gray-200 text-sm focus-visible:ring-rose-900"
                    />
                    <input
                      type="hidden"
                      name="rekomendasiAtasan"
                      value={rekomendasi}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Pilihan Utama */}
          <div className="flex flex-col gap-3 bg-gray-950/50 p-3 rounded-lg border border-gray-800">
            {!hideNoDeduction && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="no_deduction"
                  checked={deductionType === "TIDAK_DIPOTONG"}
                  onCheckedChange={(c) =>
                    c && setDeductionType("TIDAK_DIPOTONG")
                  }
                />
                <Label
                  htmlFor="no_deduction"
                  className="font-semibold text-emerald-400 cursor-pointer"
                >
                  TIDAK DIKENAKAN PEMOTONGAN
                </Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="yes_deduction"
                checked={deductionType === "DIPOTONG"}
                onCheckedChange={(c) => c && setDeductionType("DIPOTONG")}
              />
              <Label
                htmlFor="yes_deduction"
                className="font-semibold text-rose-400 cursor-pointer"
              >
                DIKENAKAN PEMOTONGAN
              </Label>
            </div>
          </div>

          {/* Munculkan rincian jika "Dikenakan Pemotongan" aktif */}
          {deductionType === "DIPOTONG" && (
            <div className="pl-4 space-y-6 border-l-2 border-gray-800 py-2">
              {/* Section Jenis Potongan */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-white border-b border-gray-800 w-full flex pb-2">
                  Rincian Pemotongan:
                </Label>

                <div className="space-y-3 pt-1">
                  <Label className="text-xs font-semibold uppercase text-gray-500">
                    Jenis Potongan
                  </Label>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center space-x-2">
                      {/* Checkbox dikontrol oleh state agar bisa otomatis diceklis */}
                      <Checkbox
                        id="p_gaji"
                        name="potongGaji"
                        checked={isPotongGaji}
                        onCheckedChange={(c) => setIsPotongGaji(c as boolean)}
                      />
                      <label
                        htmlFor="p_gaji"
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        Potong Gaji
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="p_konsum"
                        name="potongKonsumsi"
                        defaultChecked={request?.potongKonsumsi}
                      />
                      <label
                        htmlFor="p_konsum"
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        Tunjangan Konsumsi
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="p_trans"
                        name="potongTransport"
                        defaultChecked={request?.potongTransport}
                      />
                      <label
                        htmlFor="p_trans"
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        Tunjangan Transportasi
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="p_lainnya"
                        name="potongLainnya"
                        defaultChecked={request?.potongLainnya}
                      />
                      <label
                        htmlFor="p_lainnya"
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        Tunjangan Lainnya
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sisa input (Denda, Multiplier) tetap sama */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase text-gray-500">
                  Denda Telat
                </Label>
                <RadioGroup
                  defaultValue={request?.lateFine?.toString() || "0"}
                  name="lateFine"
                  className="flex flex-col gap-2.5"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="t_0" />
                    <Label htmlFor="t_0" className="text-gray-300">
                      Tidak ada
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5000" id="t_5000" />
                    <Label htmlFor="t_5000" className="text-gray-300">
                      Rp 5.000 (menit ke-6 s/d 15)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10000" id="t_10000" />
                    <Label htmlFor="t_10000" className="text-gray-300">
                      Rp 10.000 (&gt;15 menit)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">Jumlah Inval</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      name="invalCount"
                      className="w-16 bg-gray-950 border-gray-700 text-gray-200"
                      defaultValue={request?.invalCount || 0}
                      min={0}
                    />
                    <span className="text-xs text-gray-500">x Rp 5.000</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">Jumlah Shift</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      name="shiftCount"
                      className="w-16 bg-gray-950 border-gray-700 text-gray-200"
                      defaultValue={request?.shiftCount || 0}
                      min={0}
                    />
                    <span className="text-xs text-gray-500">
                      x Rp {request?.shiftRate || 30000}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-5 border-t border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-orange-700 hover:bg-orange-800 text-white min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Denda"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
