"use client";

import { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";

const initialFormState = {
  name: "",
  email: "",
  role: "TEACHER",
  supervisorId: "none",
  divisiId: "none",
  niy: "",
  phone: "",
  emergencyContact: "",
};

export default function PegawaiView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [supervisorPopoverOpen, setSupervisorPopoverOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, supRes, divRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/users/supervisors"),
        fetch("/api/division"),
      ]);

      const empData = await empRes.json();
      const supData = await supRes.json();
      const divData = await divRes.json();

      if (empData.success || empRes.ok) {
        setEmployees(
          Array.isArray(empData.data) ? empData.data : (empData?.data ?? []),
        );
      } else {
        toast.error("Gagal memuat data pegawai");
      }

      if (supData.success || supRes.ok) {
        setSupervisors(
          Array.isArray(supData.data) ? supData.data : (supData?.data ?? []),
        );
      }

      if (divData.success || divRes.ok) {
        setDivisions(
          Array.isArray(divData.data) ? divData.data : (divData?.data ?? []),
        );
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem saat mengambil data");
    }
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (employee: any) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name || employee.fullName || "",
      email: employee.email || "",
      role: employee.role || "TEACHER",
      supervisorId: employee.supervisorId || employee.supervisor?.id || "none",
      divisiId: employee.divisiId || employee.divisi?.id || "none",
      niy: employee.niy || "",
      phone: employee.phone || "",
      emergencyContact: employee.emergencyContact || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus pegawai ${name}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Pegawai berhasil dihapus");
        fetchData();
      } else {
        toast.error(data.message || data.error || "Gagal menghapus pegawai");
      }
    } catch (error) {
      toast.error("Gagal menghapus pegawai");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim())
      return toast.error("Nama dan Email wajib diisi");
    setIsSaving(true);

    const payload = {
      ...formData,
      supervisorId:
        formData.supervisorId === "none" ? null : formData.supervisorId,
      divisiId: formData.divisiId === "none" ? null : formData.divisiId,
    };

    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      console.log("editingId:", editingId, "url:", url);
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          editingId
            ? "Data pegawai diupdate!"
            : "Pegawai baru berhasil ditambahkan!",
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || data.error || "Terjadi kesalahan sistem");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
    setIsSaving(false);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase();
      const empName = (emp.name || emp.fullName || "").toLowerCase();
      const empEmail = (emp.email || "").toLowerCase();
      const empRole = (emp.role || "").toLowerCase();
      return (
        empName.includes(searchLower) ||
        empEmail.includes(searchLower) ||
        empRole.includes(searchLower)
      );
    });
  }, [employees, searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  const getSupervisorName = (employee: any) => {
    const supId = employee.supervisorId || employee.supervisor?.id;
    if (!supId) return "-";
    const supervisor = supervisors.find((sup) => sup.id === supId);
    return supervisor ? supervisor.name || supervisor.fullName : "-";
  };

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
              onClick={openCreateModal}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {isLoading && employees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      Memuat data pegawai...
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      {searchTerm
                        ? "Tidak ada pegawai yang sesuai dengan pencarian."
                        : "Belum ada data pegawai."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((emp) => (
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
                        {getSupervisorName(emp)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(emp)}
                        >
                          <Pencil className="w-4 h-4 text-amber-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(emp.id, emp.name || emp.fullName)
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

          {filteredEmployees.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="text-sm text-gray-400">
                Menampilkan{" "}
                <span className="font-medium text-white">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                hingga{" "}
                <span className="font-medium text-white">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredEmployees.length,
                  )}
                </span>{" "}
                dari total{" "}
                <span className="font-medium text-white">
                  {filteredEmployees.length}
                </span>{" "}
                pegawai
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="text-sm font-medium px-2 text-gray-300">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Form Pegawai */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingId
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
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                value={formData.niy}
                onChange={(e) =>
                  setFormData({ ...formData, niy: e.target.value })
                }
              />
            </div>

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
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
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
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
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
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
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
                value={formData.role}
                onValueChange={(val) =>
                  setFormData({ ...formData, role: val ?? "TEACHER" })
                }
              >
                <SelectTrigger
                  id="role"
                  className="bg-gray-800 border-gray-700 text-gray-200"
                >
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="TEACHER">Guru (Teacher)</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staf</SelectItem>
                  <SelectItem value="PRINCIPAL">
                    Kepala Sekolah (Principal)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="divisi" className="text-gray-300">
                Divisi
              </Label>
              <Select
                value={formData.divisiId}
                onValueChange={(val) =>
                  setFormData({ ...formData, divisiId: val ?? "none" })
                }
              >
                <SelectTrigger
                  id="divisi"
                  className="bg-gray-800 border-gray-700 text-gray-200"
                >
                  <SelectValue placeholder="Pilih divisi" />
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
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Atasan Langsung</Label>
              <Popover
                open={supervisorPopoverOpen}
                onOpenChange={setSupervisorPopoverOpen}
              >
                <PopoverTrigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white">
                  {formData.supervisorId && formData.supervisorId !== "none"
                    ? supervisors.find((s) => s.id === formData.supervisorId)
                        ?.name ||
                      supervisors.find((s) => s.name === formData.supervisorId)
                        ?.name ||
                      "Tidak ada atasan"
                    : "Pilih atasan..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-800 border-gray-700">
                  <Command>
                    <CommandInput
                      placeholder="Cari atasan..."
                      className="text-gray-200"
                    />
                    <CommandEmpty className="text-gray-400 py-2 text-center text-sm">
                      Tidak ditemukan.
                    </CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setFormData({ ...formData, supervisorId: "none" });
                          setSupervisorPopoverOpen(false);
                        }}
                        className="text-gray-200 hover:bg-gray-700"
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        -- Tidak ada atasan --
                      </CommandItem>
                      {supervisors
                        .filter((sup) => sup.id !== editingId)
                        .map((sup) => (
                          <CommandItem
                            key={sup.id}
                            value={sup.name}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                supervisorId: sup.id,
                              });
                              setSupervisorPopoverOpen(false);
                            }}
                            className="text-gray-200 hover:bg-gray-700"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.supervisorId === sup.id
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
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-crimson-700 hover:bg-crimson-800 text-white"
            >
              {isSaving ? "Menyimpan..." : "Simpan Pegawai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
