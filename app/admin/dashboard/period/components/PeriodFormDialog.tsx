// app/admin/periods/components/PeriodFormDialog.tsx
"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, CalendarDays, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PeriodFormData } from "../types";

interface PeriodFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any; // Sesuaikan dengan tipe data Bos
  setFormData: any;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  isEdit?: boolean; 
}

export function PeriodFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  submitLoading,
  isEdit,
}: PeriodFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
          <Plus className="h-4 w-4" /> Tambah Periode
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-400" /> Buat Periode Baru
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Masukkan nama periode pengajian beserta rentang tanggal cutoff absensi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Nama Periode</Label>
              <Input
                id="name"
                placeholder="Contoh: Periode Agustus 2024"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="bg-slate-950 border-slate-700"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label className="text-slate-300">Tanggal Mulai</Label>
                <Popover>
                  <PopoverTrigger>
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "justify-start text-left font-normal bg-slate-950 border-slate-700 text-slate-100 hover:bg-slate-800 w-full cursor-pointer",
                        !formData.startDate && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP", { locale: localeId }) : "Pilih tanggal"}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label className="text-slate-300">Tanggal Selesai</Label>
                <Popover>
                  <PopoverTrigger>
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "justify-start text-left font-normal bg-slate-950 border-slate-700 text-slate-100 hover:bg-slate-800 w-full cursor-pointer",
                        !formData.endDate && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP", { locale: localeId }) : "Pilih tanggal"}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-800 border-slate-700 text-slate-200"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={submitLoading || !formData.startDate || !formData.endDate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Periode"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}