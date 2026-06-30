// app/admin/pengaturan-jadwal/components/SpecialWorkDateForm.tsx

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpecialWorkDateFormState } from "../types";

interface Props {
  form: SpecialWorkDateFormState;
  setForm: (form: SpecialWorkDateFormState) => void;
  onSave: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

export function SpecialWorkDateForm({ form, setForm, onSave, isLoading, isEditing }: Props) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg mb-6 border border-gray-700 space-y-4">
      {/* Baris 1: Keterangan Kegiatan */}
      <div className="space-y-2">
        <Label className="text-gray-300">Keterangan / Nama Hari Kerja Khusus</Label>
        <Input
          placeholder="Contoh: Event Bakti Sosial Akhir Pekan"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
        />
      </div>

      {/* Baris 2: Tanggal & Jam Operasional Kerja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Tanggal Mulai</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Tanggal Selesai</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
          />
        </div>
        
        {/* JAM MULAI (Flekibel / Opsional) */}
        <div className="space-y-2">
          <Label className="text-gray-300">Jam Mulai Kerja <span className="text-gray-500 text-xs">(Opsional)</span></Label>
          <Input
            type="time"
            // Tambahkan || "" agar React tidak error jika form.startTime bernilai null/undefined
            value={form.startTime || ""} 
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700 [color-scheme:dark]"
          />
          <p className="text-[10px] text-gray-500 mt-1">Kosongkan untuk ikut jam shift reguler</p>
        </div>
        
        {/* JAM SELESAI (Fleksibel / Opsional) */}
        <div className="space-y-2">
          <Label className="text-gray-300">Jam Selesai Kerja <span className="text-gray-500 text-xs">(Opsional)</span></Label>
          <Input
            type="time"
            value={form.endTime || ""} 
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700 [color-scheme:dark]"
          />
          <p className="text-[10px] text-gray-500 mt-1">Kosongkan untuk ikut jam shift reguler</p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={isLoading} className="bg-crimson-700 hover:bg-crimson-800 text-white">
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? "Update Hari Kerja" : "Simpan Hari Kerja"}
        </Button>
      </div>
    </div>
  );
}