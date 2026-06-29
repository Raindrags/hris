
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShiftFormState } from "../types";

interface Props {
  form: ShiftFormState;
  setForm: (form: ShiftFormState) => void;
  onDetailChange: (index: number, field: keyof ShiftFormState["details"][0], value: any) => void;
  onSave: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

export function ShiftForm({ form, setForm, onDetailChange, onSave, isLoading, isEditing }: Props) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg mb-6 border border-gray-700 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Nama Template Jadwal</Label>
          <Input
            placeholder="Contoh: Guru Reguler, Satpam Pagi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
          />
        </div>
        <div className="space-y-2 flex flex-col justify-end pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flexible"
              checked={form.isFlexible}
              onCheckedChange={(c) => setForm({ ...form, isFlexible: !!c })}
            />
            <Label htmlFor="flexible" className="text-gray-300 cursor-pointer">
              Jadwal Flexible (Bebas jam masuk, hanya hitung total jam)
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold text-white">Pengaturan Jam per Hari</Label>
        <div className="border border-gray-700 rounded-md divide-y divide-gray-700 overflow-hidden">
          {form.details.map((day, index) => (
            <div
              key={day.dayOfWeek}
              className={`flex items-center gap-4 p-3 transition-colors ${
                day.isActive ? "bg-gray-800" : "bg-gray-900/50"
              }`}
            >
              <div className="w-32 flex items-center gap-2">
                <Checkbox
                  checked={day.isActive}
                  onCheckedChange={(c) => onDetailChange(index, "isActive", !!c)}
                />
                <Label className={day.isActive ? "font-medium text-gray-200" : "text-gray-500 cursor-pointer"}>
                  {day.dayName}
                </Label>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-400 w-12">Masuk</Label>
                  <Input
                    type="time"
                    value={day.checkIn}
                    disabled={!day.isActive}
                    className={!day.isActive ? "opacity-50" : "bg-gray-800 border-gray-700 text-gray-100"}
                    onChange={(e) => onDetailChange(index, "checkIn", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-400 w-16">Pulang</Label>
                  <Input
                    type="time"
                    value={day.checkOut}
                    disabled={!day.isActive}
                    className={!day.isActive ? "opacity-50" : "bg-gray-800 border-gray-700 text-gray-100"}
                    onChange={(e) => onDetailChange(index, "checkOut", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={isLoading} className="bg-crimson-700 hover:bg-crimson-800 text-white">
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? "Update Template" : "Simpan Template"}
        </Button>
      </div>
    </div>
  );
}