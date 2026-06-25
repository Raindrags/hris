import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  User,
  Mail,
  Phone,
  AlertTriangle,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const initialFormState = {
  name: "",
  email: "",
  role: "USER",
  supervisorId: "none",
  divisiId: "none",
  niy: "",
  phone: "",
  emergencyContact: "",
  jabatan: "",
  jatahCuti: "",
};

interface PegawaiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any, editingId: string | null) => void;
  isSaving: boolean;
  initialData: any | null; // Data pegawai jika edit, null jika tambah baru
  supervisors: any[];
  divisions: any[];
}

export function PegawaiFormModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  initialData,
  supervisors,
  divisions,
}: PegawaiFormModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [supervisorPopoverOpen, setSupervisorPopoverOpen] = useState(false);

  // Set form data saat modal dibuka / initialData berubah
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || initialData.fullName || "",
        email: initialData.email || "",
        role: initialData.role || "USER",
        supervisorId:
          initialData.supervisorId || initialData.supervisor?.id || "none",
        divisiId: initialData.divisiId || initialData.divisi?.id || "none",
        niy: initialData.niy || "",
        phone: initialData.phone || "",
        emergencyContact: initialData.emergencyContact || "",
        jabatan: initialData.jabatan || "",
        jatahCuti: initialData.jatahCuti || "",
      });
    } else if (isOpen && !initialData) {
      setFormData(initialFormState);
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return toast.error("Nama dan Email wajib diisi");
    }
    const payload = {
      ...formData,
      supervisorId:
        formData.supervisorId === "none" ? null : formData.supervisorId,
      divisiId: formData.divisiId === "none" ? null : formData.divisiId,
    };
    onSave(payload, initialData?.id || null);
  };

  const hideJatahCuti = /guru|kepala sekolah|wakil kepala sekolah/i.test(
    formData.jabatan,
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initialData ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {initialData
              ? "Perbarui informasi profil pegawai."
              : "Masukkan detail informasi untuk pegawai baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Contoh: Siti Aminah"
                className="pl-9 bg-gray-800 border-gray-700 text-gray-100"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">NIY / Jabatan</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="NIY"
                className="bg-gray-800 border-gray-700 text-gray-100"
                value={formData.niy}
                onChange={(e) =>
                  setFormData({ ...formData, niy: e.target.value })
                }
              />
              <Input
                placeholder="Jabatan"
                className="bg-gray-800 border-gray-700 text-gray-100"
                value={formData.jabatan}
                onChange={(e) =>
                  setFormData({ ...formData, jabatan: e.target.value })
                }
              />
            </div>
          </div>

          {!hideJatahCuti && (
            <div className="space-y-2">
              <Label className="text-gray-300">Jatah Cuti (Hari)</Label>
              <Input
                type="number"
                placeholder="12"
                className="bg-gray-800 border-gray-700 text-gray-100"
                value={formData.jatahCuti}
                onChange={(e) =>
                  setFormData({ ...formData, jatahCuti: e.target.value })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-300">Kontak (Email & HP)</Label>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="email"
                  placeholder="siti@sekolah.com"
                  className="pl-9 bg-gray-800 border-gray-700"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="0812xxxx"
                  className="pl-9 bg-gray-800 border-gray-700"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Divisi & Peran</Label>
            <div className="grid grid-cols-2 gap-2">
              {/* FIX DI BAGIAN ONVALUECHANGE SEPERTI DI BAWAH INI */}
              <Select
                value={formData.divisiId}
                onValueChange={(val) =>
                  setFormData({ ...formData, divisiId: val ?? "none" })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Divisi" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="none">-- Tanpa Divisi --</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.role}
                onValueChange={(val) =>
                  setFormData({ ...formData, role: val ?? "USER" })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Peran" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Atasan Langsung</Label>
            <Popover
              open={supervisorPopoverOpen}
              onOpenChange={setSupervisorPopoverOpen}
            >
              <PopoverTrigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200">
                {formData.supervisorId !== "none"
                  ? supervisors.find((s) => s.id === formData.supervisorId)
                      ?.name || "Pilih atasan..."
                  : "Tidak ada atasan"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-gray-700">
                <Command className="bg-gray-900 text-gray-200">
                  <CommandInput placeholder="Cari atasan..." />
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    <CommandItem
                      className="hover:bg-gray-800"
                      value="none"
                      onSelect={() => {
                        setFormData({ ...formData, supervisorId: "none" });
                        setSupervisorPopoverOpen(false);
                      }}
                    >
                      -- Tidak ada atasan --
                    </CommandItem>
                    {supervisors
                      .filter((sup) => sup.id !== initialData?.id)
                      .map((sup) => (
                        <CommandItem
                          key={sup.id}
                          value={sup.name}
                          onSelect={() => {
                            setFormData({ ...formData, supervisorId: sup.id });
                            setSupervisorPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${formData.supervisorId === sup.id ? "opacity-100" : "opacity-0"}`}
                          />{" "}
                          {sup.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-crimson-700 hover:bg-crimson-800 text-white"
          >
            {isSaving ? "Menyimpan..." : "Simpan Pegawai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
