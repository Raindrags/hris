"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  User,
  Briefcase,
  Bug,
  ChevronLeft,
  ChevronRight,
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
import { toast } from "sonner";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getSupervisors,
} from "@/app/actions/pegawai-action";

const initialFormState = {
  name: "",
  email: "",
  role: "TEACHER",
  supervisorId: "none",
};

export default function PegawaiView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data State
  const [employees, setEmployees] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // ==========================================
  // STATE PAGINASI
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Ubah angka ini jika ingin menampilkan lebih banyak baris (misal 10)

  useEffect(() => {
    fetchData();
  }, []);

  // Kembalikan ke halaman 1 setiap kali user mengetik di kotak pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const [empRes, supRes] = await Promise.all([
        getEmployees(),
        getSupervisors(),
      ]);

      if (empRes.success) {
        setEmployees(
          Array.isArray(empRes.data) ? empRes.data : empRes.data?.data || [],
        );
      } else {
        toast.error("Gagal memuat data pegawai");
      }

      if (supRes.success) {
        setSupervisors(
          Array.isArray(supRes.data) ? supRes.data : supRes.data?.data || [],
        );
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem saat mengambil data");
    }

    setIsLoading(false);
  };

  // HANDLERS
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
      supervisorId: employee.supervisorId || "none",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus pegawai ${name}?`)) return;
    setIsLoading(true);
    const res = await deleteEmployee(id);
    if (res?.success) {
      toast.success("Pegawai berhasil dihapus");
      fetchData();
    } else {
      toast.error(res?.message || "Gagal menghapus pegawai");
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
    };
    let res = editingId
      ? await updateEmployee(editingId, payload)
      : await createEmployee(payload);
    if (res?.success) {
      toast.success(
        editingId
          ? "Data pegawai diupdate!"
          : "Pegawai baru berhasil ditambahkan!",
      );
      setIsModalOpen(false);
      fetchData();
    } else {
      toast.error(res?.message || "Terjadi kesalahan sistem");
    }
    setIsSaving(false);
  };

  // ==========================================
  // LOGIKA PENCARIAN & PAGINASI
  // ==========================================

  // 1. Filter data berdasarkan pencarian
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

  // 2. Hitung total halaman
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // 3. Potong data sesuai halaman saat ini
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
          <div>
            <CardTitle>Manajemen Pegawai</CardTitle>
            <CardDescription>
              Kelola data seluruh pegawai, peran (role), dan pengaturan atasan.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" /> Tambah Pegawai
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau role..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Pegawai</TableHead>
                  <TableHead>NIY</TableHead>
                  <TableHead>Atasan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && employees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Memuat data pegawai...
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
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
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {emp.name || emp.fullName || "Nama tidak ada"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />{" "}
                            {emp.email || "Email tidak ada"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{emp.niy || "Tidak ada NIY"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {emp.supervisorId}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(emp)}
                        >
                          <Pencil className="w-4 h-4 text-orange-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(emp.id, emp.name || emp.fullName)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ========================================== KONTROL PAGINASI ========================================== */}
          {filteredEmployees.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="text-sm text-muted-foreground">
                Menampilkan{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                hingga{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredEmployees.length,
                  )}
                </span>{" "}
                dari total{" "}
                <span className="font-medium">{filteredEmployees.length}</span>{" "}
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
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="text-sm font-medium px-2">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* MODAL FORM PEGAWAI */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi profil pegawai di bawah ini."
                : "Masukkan detail informasi untuk pegawai baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Contoh: Siti Aminah"
                  className="pl-9"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="siti@sekolah.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Peran (Role)</Label>
              <Select
                value={formData.role}
                onValueChange={(val) =>
                  setFormData({ ...formData, role: val ?? "TEACHER" })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="supervisor">Atasan Langsung (Opsional)</Label>
              <Select
                value={formData.supervisorId}
                onValueChange={(val) =>
                  setFormData({ ...formData, supervisorId: val ?? "none" })
                }
              >
                <SelectTrigger id="supervisor">
                  <SelectValue placeholder="Pilih atasan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tidak ada atasan --</SelectItem>
                  {supervisors.map(
                    (sup) =>
                      sup.id !== editingId && (
                        <SelectItem key={sup.id} value={sup.name}>
                          {sup.name || sup.fullName} ({sup.role})
                        </SelectItem>
                      ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Pegawai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
