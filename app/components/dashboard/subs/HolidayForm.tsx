import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  form: { startDate: string; endDate: string; description: string };
  setForm: (form: {
    startDate: string;
    endDate: string;
    description: string;
  }) => void;
  onSave: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

export function HolidayForm({
  form,
  setForm,
  onSave,
  isLoading,
  isEditing,
}: Props) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg mb-6 border border-gray-700 space-y-4">
      {/* Baris 1: Deskripsi */}
      <div className="space-y-2">
        <Label className="text-gray-300">Deskripsi / Keterangan Libur</Label>
        <Input
          placeholder="Contoh: Cuti Bersama Idul Fitri"
          // ✨ FIX: Tambahkan || ""
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
        />
      </div>

      {/* Baris 2: Tanggal Mulai & Selesai */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Tanggal Mulai</Label>
          <Input
            type="date"
            // ✨ FIX: Tambahkan || ""
            value={form.startDate || ""}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Tanggal Selesai</Label>
          <Input
            type="date"
            // ✨ FIX: Tambahkan || ""
            value={form.endDate || ""}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="bg-crimson-700 hover:bg-crimson-800 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? "Update Hari Libur" : "Simpan Hari Libur"}
        </Button>
      </div>
    </div>
  );
}
