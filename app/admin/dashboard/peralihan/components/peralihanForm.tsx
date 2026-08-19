import { useState } from "react";
import { Save, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PeralihanFormState, Supervisor } from "../types";

interface Props {
  form: PeralihanFormState;
  setForm: (form: PeralihanFormState) => void;
  supervisors: Supervisor[];
  allUsers: Supervisor[];
  onSave: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

export function PeralihanAtasanForm({
  form,
  setForm,
  supervisors,
  allUsers,
  onSave,
  isLoading,
  isEditing,
}: Props) {
  // State untuk mengatur buka/tutup Popover
  const [lamaPopoverOpen, setLamaPopoverOpen] = useState(false);
  const [baruPopoverOpen, setBaruPopoverOpen] = useState(false);

  // State untuk menangkap input pencarian
  const [searchLama, setSearchLama] = useState("");
  const [searchBaru, setSearchBaru] = useState("");

  // Pastikan selalu berupa array
  const safeSupervisors = Array.isArray(supervisors) ? supervisors : [];
  const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];

  // Logika Filter & Limit Data Atasan Lama (Maksimal 15 Data)
  const filteredLama = safeSupervisors.filter((sup) =>
    sup.name.toLowerCase().includes(searchLama.toLowerCase()),
  );
  const displayedLama = filteredLama.slice(0, 15);

  // Logika Filter & Limit Data Atasan Baru/Semua User (Maksimal 15 Data)
  const filteredBaru = safeAllUsers.filter((user) =>
    user.name.toLowerCase().includes(searchBaru.toLowerCase()),
  );
  const displayedBaru = filteredBaru.slice(0, 15);

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg mb-6 border border-gray-700 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Atasan Lama (Yang Digantikan) */}
        <div className="space-y-2">
          <Label className="text-gray-300">Atasan yang Digantikan (Lama)</Label>
          <Popover open={lamaPopoverOpen} onOpenChange={setLamaPopoverOpen}>
            <PopoverTrigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white h-10 mt-1">
              {form.atasanLamaId
                ? safeSupervisors.find(
                    (s) => String(s.id) === String(form.atasanLamaId),
                  )?.name || "Pilih atasan lama..."
                : "Pilih atasan lama..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-gray-700">
              {/* Matikan filter bawaan dengan shouldFilter={false} */}
              <Command
                shouldFilter={false}
                className="bg-gray-900 text-gray-200"
              >
                <CommandInput
                  placeholder="Cari atasan lama..."
                  className="text-gray-200"
                  value={searchLama}
                  onValueChange={setSearchLama}
                />
                <CommandEmpty className="text-gray-400 py-2 text-center text-sm">
                  Data tidak ditemukan.
                </CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {displayedLama.map((sup) => (
                    <CommandItem
                      key={`lama-${sup.id}`}
                      value={sup.name}
                      onSelect={() => {
                        setForm({ ...form, atasanLamaId: String(sup.id) });
                        setLamaPopoverOpen(false);
                        setSearchLama(""); // Reset pencarian
                      }}
                      className="text-gray-200 bg-slate-900 hover:bg-gray-700 cursor-pointer"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          String(form.atasanLamaId) === String(sup.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {sup.name}
                    </CommandItem>
                  ))}

                  {filteredLama.length > 15 && (
                    <div className="px-2 py-3 text-xs text-center text-gray-500 italic border-t border-gray-800 mt-1">
                      Menampilkan 15 dari {filteredLama.length} data. Ketik
                      untuk mencari...
                    </div>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Atasan Baru (Dialihkan Kepada) */}
        <div className="space-y-2">
          <Label className="text-gray-300 flex items-center justify-between">
            Dialihkan Kepada (Pegawai Pengganti)
            <span className="text-xs text-amber-500 bg-amber-900/30 px-2 py-0.5 rounded">
              {safeAllUsers.length} data
            </span>
          </Label>
          <Popover open={baruPopoverOpen} onOpenChange={setBaruPopoverOpen}>
            <PopoverTrigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white h-10 mt-1">
              {form.atasanBaruId
                ? safeAllUsers.find(
                    (s) => String(s.id) === String(form.atasanBaruId),
                  )?.name || "Pilih pegawai pengganti..."
                : "Pilih pegawai pengganti..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-gray-700">
              {/* Matikan filter bawaan dengan shouldFilter={false} */}
              <Command
                shouldFilter={false}
                className="bg-gray-900 text-gray-200"
              >
                <CommandInput
                  placeholder="Ketik nama untuk mencari..."
                  className="text-gray-200"
                  value={searchBaru}
                  onValueChange={setSearchBaru}
                />
                <CommandEmpty className="text-gray-400 py-2 text-center text-sm">
                  Pegawai tidak ditemukan.
                </CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {displayedBaru.map((user) => (
                    <CommandItem
                      key={`baru-${user.id}`}
                      value={user.name}
                      onSelect={() => {
                        setForm({ ...form, atasanBaruId: String(user.id) });
                        setBaruPopoverOpen(false);
                        setSearchBaru(""); // Reset pencarian
                      }}
                      className="text-gray-200 bg-slate-900 hover:bg-gray-700 cursor-pointer"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          String(form.atasanBaruId) === String(user.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {user.name}
                    </CommandItem>
                  ))}

                  {filteredBaru.length > 15 && (
                    <div className="px-2 py-3 text-xs text-center text-gray-500 italic border-t border-gray-800 mt-1">
                      Menampilkan 15 dari {filteredBaru.length} data. Ketik
                      untuk mencari...
                    </div>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Tanggal Mulai */}
        <div className="space-y-2 mt-2">
          <Label className="text-gray-300">Tanggal Mulai Berlaku</Label>
          <Input
            type="date"
            value={form.tanggalMulai}
            onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100 h-10"
          />
        </div>

        {/* Tanggal Berakhir */}
        <div className="space-y-2 mt-2">
          <Label className="text-gray-300">
            Tanggal Berakhir (Otomatis Kembali)
          </Label>
          <Input
            type="date"
            value={form.tanggalBerakhir}
            onChange={(e) =>
              setForm({ ...form, tanggalBerakhir: e.target.value })
            }
            className="bg-gray-800 border-gray-700 text-gray-100 h-10"
          />
        </div>

        {/* Alasan */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-gray-300">Alasan Peralihan (Opsional)</Label>
          <Input
            placeholder="Contoh: Cuti Tahunan, Sakit, Penugasan Luar Kota..."
            value={form.alasan}
            onChange={(e) => setForm({ ...form, alasan: e.target.value })}
            className="bg-gray-800 border-gray-700 text-gray-100"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onSave}
          disabled={
            isLoading ||
            safeSupervisors.length === 0 ||
            safeAllUsers.length === 0
          }
          className="bg-crimson-700 hover:bg-crimson-800 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? "Update Peralihan" : "Simpan Peralihan"}
        </Button>
      </div>
    </div>
  );
}
