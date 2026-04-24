"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/app/actions/holiday-action";
import { getUsers } from "@/app/actions/get-user-action";
import { HolidayTable } from "../table/holiday-table";

interface Holiday {
  id: string;
  date: string;
  description: string;
  users: { id: string; name: string; niy: string }[];
}

interface UserOption {
  id: string;
  name: string;
  niy: string;
  divisi?: { name: string };
}

export function HolidayManager() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: "", description: "" });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignHolidayId, setAssignHolidayId] = useState<string | null>(null);
  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);

  // Fetch data awal – dijalankan sekali saat mount
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [holidayRes, userRes] = await Promise.all([
      getHolidays(),
      getUsers(),
    ]);
    if (holidayRes.success) setHolidays(holidayRes.data);
    if (userRes.success) setUsers(userRes.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handler CRUD ---
  const handleSave = async () => {
    if (!formData.date || !formData.description) {
      toast.error("Tanggal dan deskripsi wajib diisi");
      return;
    }
    const payload = {
      date: formData.date,
      description: formData.description,
      userIds: selectedUserIds.length ? selectedUserIds : null,
    };
    let res;
    if (editingId) {
      res = await updateHoliday(editingId, payload);
    } else {
      res = await createHoliday(payload);
    }
    if (res.success) {
      toast.success(editingId ? "Libur diperbarui" : "Libur ditambahkan");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } else {
      toast.error(res.error || "Gagal menyimpan");
    }
  };

  // Handler delete – dibungkus useCallback agar referensinya stabil
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Hapus hari libur ini?")) return;
      const res = await deleteHoliday(id);
      if (res.success) {
        toast.success("Libur dihapus");
        fetchData();
      } else {
        toast.error(res.error || "Gagal menghapus");
      }
    },
    [fetchData],
  );

  // Buka modal edit
  const openEdit = useCallback((holiday: Holiday) => {
    setEditingId(holiday.id);
    setFormData({ date: holiday.date, description: holiday.description });
    setSelectedUserIds(holiday.users.map((u) => u.id));
    setDialogOpen(true);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ date: "", description: "" });
    setSelectedUserIds([]);
  };

  // --- Assign modal handlers ---
  const openAssignModal = useCallback((holiday: Holiday) => {
    setAssignHolidayId(holiday.id);
    setAssignSelectedIds(holiday.users.map((u) => u.id));
    setAssignModalOpen(true);
  }, []);

  const handleAssignSave = async () => {
    if (!assignHolidayId) return;
    const res = await updateHoliday(assignHolidayId, {
      userIds: assignSelectedIds.length ? assignSelectedIds : null,
    });
    if (res.success) {
      toast.success("Penugasan pegawai diperbarui");
      setAssignModalOpen(false);
      fetchData();
    } else {
      toast.error(res.error || "Gagal menyimpan penugasan");
    }
  };

  const toggleAssignUser = useCallback((userId: string) => {
    setAssignSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Hari Libur
        </Button>
      </div>

      {/* Tabel yang sudah di-memo dan menerima handler stabil */}
      <HolidayTable
        holidays={holidays}
        isLoading={isLoading}
        onAssign={openAssignModal}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Modal Tambah/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Hari Libur" : "Tambah Hari Libur"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Contoh: Cuti Bersama"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Assign Pegawai */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Atur Pegawai untuk Hari Libur Ini</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={
                        users.length > 0 &&
                        assignSelectedIds.length === users.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked)
                          setAssignSelectedIds(users.map((u) => u.id));
                        else setAssignSelectedIds([]);
                      }}
                    />
                  </TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIY</TableHead>
                  <TableHead>Divisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={assignSelectedIds.includes(u.id)}
                        onCheckedChange={() => toggleAssignUser(u.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.niy || "-"}</TableCell>
                    <TableCell>{u.divisi?.name || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Kosongkan pilihan untuk berlaku ke semua pegawai.
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAssignSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
