"use client";

import { useState } from "react";
import { useNoFpAdminForm } from "../hooks/useNoFpAdminForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ShieldCheck, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoFpAdminFormProps {
  onSuccess?: () => void;
}

export default function NoFpAdminForm({ onSuccess }: NoFpAdminFormProps) {
  const { states, actions } = useNoFpAdminForm(onSuccess);

  // State tambahan untuk mengontrol buka/tutup dropdown Combobox[cite: 18]
  const [openCombobox, setOpenCombobox] = useState(false);

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden mx-auto">
      {/* HEADER[cite: 18] */}
      <div className="p-6 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold text-white">Input Lupa/Error FP</h2>
          <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Bypass Approval
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Formulir khusus admin. Data yang diinput akan langsung berstatus
          disetujui.
        </p>
      </div>

      <form onSubmit={actions.handleSubmit} className="p-6 space-y-6">
        {/* PEGAWAI - MENGGUNAKAN COMBOBOX (SEARCHABLE)[cite: 18] */}
        <div className="space-y-2 flex flex-col">
          <Label className="text-slate-300">
            Pilih Pegawai <span className="text-red-400">*</span>
          </Label>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between bg-slate-950 border-slate-700 text-slate-100 hover:bg-slate-900 hover:text-white"
              >
                {states.userId
                  ? states.users.find((user) => user.id === states.userId)?.name
                  : "Pilih atau cari nama pegawai..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0 bg-slate-800 border-slate-700"
              align="start"
            >
              <Command className="bg-transparent text-slate-100">
                <CommandInput
                  placeholder="Ketik nama pegawai..."
                  className="text-slate-100 placeholder:text-slate-400"
                />
                <CommandList className="max-h-60 custom-scrollbar">
                  <CommandEmpty className="py-6 text-center text-sm text-slate-400">
                    Pegawai tidak ditemukan.
                  </CommandEmpty>
                  <CommandGroup>
                    {states.users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => {
                          actions.setUserId(user.id);
                          setOpenCombobox(false);
                        }}
                        className="text-slate-200 hover:bg-slate-700 hover:text-white aria-selected:bg-slate-700 aria-selected:text-white cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-blue-500",
                            states.userId === user.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {user.name}{" "}
                        {user.divisi
                          ? `— ${typeof user.divisi === "object" ? user.divisi.name : user.divisi}`
                          : ""}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* Input hidden untuk memastikan validasi HTML 'required' tetap berjalan[cite: 18] */}
          <input type="hidden" name="userId" value={states.userId} required />
        </div>

        {/* TANGGAL[cite: 18] */}
        <div className="space-y-2">
          <Label className="text-slate-300">
            Tanggal Kejadian <span className="text-red-400">*</span>
          </Label>
          <Input
            type="date"
            value={states.date}
            onChange={(e) => actions.setDate(e.target.value)}
            className="bg-slate-950 border-slate-700 text-slate-100 block w-full"
            required
          />
        </div>

        {/* CHECKBOX NO FP[cite: 18] */}
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
          <Label className="text-slate-300">
            Sesi Lupa/Error Fingerprint <span className="text-red-400">*</span>
          </Label>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={states.fpDatang}
                onChange={(e) => actions.setFpDatang(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm text-slate-200 group-hover:text-white transition-colors">
                FP Datang (Masuk)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={states.fpPulang}
                onChange={(e) => actions.setFpPulang(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm text-slate-200 group-hover:text-white transition-colors">
                FP Pulang (Keluar)
              </span>
            </label>
          </div>
        </div>

        {/* ACTION BUTTONS[cite: 18] */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={states.loading}
            className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {states.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" /> Simpan Data (Bypass)
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
