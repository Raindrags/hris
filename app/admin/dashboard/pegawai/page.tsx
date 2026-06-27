"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Phone,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEmployees } from "./hooks/useEmployees";
import { ITEMS_PER_PAGE } from "./constants";

export default function PegawaiView() {
  const { state, actions } = useEmployees();

  // UI State murni kosmetik untuk dropdown
  const [supervisorPopoverOpen, setSupervisorPopoverOpen] = useState(false);

  // Helper untuk override SelectValue pada Divisi (seperti yang kita bahas sebelumnya)
  const selectedDivisionName =
    state.formData.divisiId === "none"
      ? "Pilih Divisi"
      : state.divisions.find(
          (div) => String(div.id) === String(state.formData.divisiId),
        )?.name || "Pilih Divisi";

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-md text-gray-100">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-4 gap-4">
          <div>
            <CardTitle className="text-white">Manajemen Pegawai</CardTitle>
            <CardDescription className="text-gray-400">
              Kelola data seluruh pegawai, peran (role), dan pengaturan atasan.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={actions.openCreateModal}
              className="bg-crimson-700 hover:bg-crimson-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Pegawai
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, email, atau role..."
                className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700 focus:ring-crimson-500/20"
                value={state.searchTerm}
                onChange={(e) => actions.setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="border border-gray-800 rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-800/50">
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Pegawai</TableHead>
                  <TableHead className="text-gray-300">NIY</TableHead>
                  <TableHead className="text-gray-300">Divisi</TableHead>
                  <TableHead className="text-gray-300">Atasan</TableHead>
                  <TableHead className="text-right text-gray-300">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.isLoading && state.employees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      Memuat data pegawai...
                    </TableCell>
                  </TableRow>
                ) : state.filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      {state.searchTerm
                        ? "Tidak ada pegawai yang sesuai dengan pencarian."
                        : "Belum ada data pegawai."}
                    </TableCell>
                  </TableRow>
                ) : (
                  state.paginatedEmployees.map((emp) => (
                    <TableRow
                      key={emp.id}
                      className="border-gray-800 hover:bg-gray-800/40 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">
                            {emp.name || emp.fullName || "Nama tidak ada"}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />{" "}
                            {emp.email || "Email tidak ada"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {emp.niy || "-"}
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {emp.divisi?.name || "-"}
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {actions.getSupervisorName(emp)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => actions.openEditModal(emp)}
                        >
                          <Pencil className="w-4 h-4 text-amber-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            actions.handleDelete(
                              emp.id,
                              emp.name || emp.fullName || "Pegawai",
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {state.filteredEmployees.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="text-sm text-gray-400">
                Menampilkan{" "}
                <span className="font-medium text-white">
                  {(state.currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                hingga{" "}
                <span className="font-medium text-white">
                  {Math.min(
                    state.currentPage * ITEMS_PER_PAGE,
                    state.filteredEmployees.length,
                  )}
                </span>{" "}
                dari total{" "}
                <span className="font-medium text-white">
                  {state.filteredEmployees.length}
                </span>{" "}
                pegawai
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    actions.setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={state.currentPage === 1}
                  className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="text-sm font-medium px-2 text-gray-300">
                  Halaman {state.currentPage} dari {state.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    actions.setCurrentPage((prev) =>
                      Math.min(state.totalPages, prev + 1),
                    )
                  }
                  disabled={state.currentPage === state.totalPages}
                  className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={state.isModalOpen} onOpenChange={actions.setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">
              {state.editingId ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {state.editingId
                ? "Perbarui informasi profil pegawai di bawah ini."
                : "Masukkan detail informasi untuk pegawai baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nama Lengkap
              </Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  placeholder="Contoh: Siti Aminah"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                  value={state.formData.name}
                  onChange={(e) =>
                    actions.setFormData({
                      ...state.formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niy" className="text-gray-300">
                NIY (Nomor Induk Yayasan)
              </Label>
              <Input
                id="niy"
                placeholder="Masukkan NIY"
                className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                value={state.formData.niy}
                onChange={(e) =>
                  actions.setFormData({
                    ...state.formData,
                    niy: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatan" className="text-gray-300">
                Jabatan
              </Label>
              <Input
                id="jabatan"
                placeholder="Contoh: Guru Matematika"
                className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                value={state.formData.jabatan}
                onChange={(e) =>
                  actions.setFormData({
                    ...state.formData,
                    jabatan: e.target.value,
                  })
                }
              />
            </div>

            {!state.hideJatahCuti && (
              <div className="space-y-2">
                <Label htmlFor="jatahCuti" className="text-gray-300">
                  Jatah Cuti (Hari)
                </Label>
                <Input
                  id="jatahCuti"
                  type="number"
                  placeholder="12"
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                  value={state.formData.jatahCuti}
                  onChange={(e) =>
                    actions.setFormData({
                      ...state.formData,
                      jatahCuti: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="siti@sekolah.com"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                  value={state.formData.email}
                  onChange={(e) =>
                    actions.setFormData({
                      ...state.formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                Nomor HP / WhatsApp
              </Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
                  placeholder="0812xxxx"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                  value={state.formData.phone}
                  onChange={(e) =>
                    actions.setFormData({
                      ...state.formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-gray-300">
                Kontak Darurat
              </Label>
              <div className="relative">
                <AlertTriangle className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="emergencyContact"
                  placeholder="Nama - 0812xxxx"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                  value={state.formData.emergencyContact}
                  onChange={(e) =>
                    actions.setFormData({
                      ...state.formData,
                      emergencyContact: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-300">
                Peran (Role)
              </Label>
              <Select
                value={state.formData.role}
                onValueChange={(val) =>
                  actions.setFormData({
                    ...state.formData,
                    role: val ?? "USER",
                  })
                }
              >
                <SelectTrigger
                  id="role"
                  className="bg-gray-800 border-gray-700 text-gray-200"
                >
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="divisi" className="text-gray-300">
                Divisi
              </Label>
              <Select
                value={String(state.formData.divisiId)}
                onValueChange={(val) =>
                  actions.setFormData({
                    ...state.formData,
                    divisiId: val ?? "none",
                  })
                }
              >
                <SelectTrigger
                  id="divisi"
                  className="bg-gray-800 border-gray-700 text-gray-200"
                >
                  <SelectValue placeholder="Pilih divisi">
                    {selectedDivisionName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="none">-- Tanpa Divisi --</SelectItem>
                  {state.divisions.map((div) => (
                    <SelectItem key={div.id} value={String(div.id)}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Atasan Langsung</Label>
              <Popover
                open={supervisorPopoverOpen}
                onOpenChange={setSupervisorPopoverOpen}
              >
                <PopoverTrigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white">
                  {state.formData.supervisorId &&
                  state.formData.supervisorId !== "none"
                    ? state.supervisors.find(
                        (s) =>
                          String(s.id) === String(state.formData.supervisorId),
                      )?.name ||
                      state.supervisors.find(
                        (s) => s.name === state.formData.supervisorId,
                      )?.name ||
                      "Tidak ada atasan"
                    : "Pilih atasan..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-gray-700">
                  <Command className="bg-gray-900 text-gray-200">
                    <CommandInput
                      placeholder="Cari atasan..."
                      className="text-gray-200"
                    />
                    <CommandEmpty className="text-gray-400 py-2 text-center text-sm">
                      Tidak ditemukan.
                    </CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      <CommandItem
                        className="text-gray-200 bg-slate-900 hover:bg-gray-700"
                        value="none"
                        onSelect={() => {
                          actions.setFormData({
                            ...state.formData,
                            supervisorId: "none",
                          });
                          setSupervisorPopoverOpen(false);
                        }}
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        -- Tidak ada atasan --
                      </CommandItem>
                      {state.supervisors
                        .filter((sup) => String(sup.id) !== state.editingId)
                        .map((sup) => (
                          <CommandItem
                            key={sup.id}
                            value={sup.name || sup.fullName || ""}
                            onSelect={() => {
                              actions.setFormData({
                                ...state.formData,
                                supervisorId: String(sup.id),
                              });
                              setSupervisorPopoverOpen(false);
                            }}
                            className="text-gray-200 bg-slate-900 hover:bg-gray-700"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                String(state.formData.supervisorId) ===
                                String(sup.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {sup.name || sup.fullName} ({sup.role})
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
              onClick={() => actions.setIsModalOpen(false)}
              disabled={state.isSaving}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={actions.handleSave}
              disabled={state.isSaving}
              className="bg-crimson-700 hover:bg-crimson-800 text-white"
            >
              {state.isSaving ? "Menyimpan..." : "Simpan Pegawai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
