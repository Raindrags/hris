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
    <div className="space-y-4 text-gray-100">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-crimson-700 hover:bg-crimson-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Hari Libur
        </Button>
      </div>

      <HolidayTable
        holidays={holidays}
        isLoading={isLoading}
        onAssign={openAssignModal}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Hari Libur" : "Tambah Hari Libur"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Tanggal</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
              />
            </div>
            <div>
              <Label className="text-gray-300">Deskripsi</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Contoh: Cuti Bersama"
                className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-700 bg-red-600 text-gray-300 hover:bg-red-700 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-crimson-700 hover:bg-crimson-800 text-white"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">
              Atur Pegawai untuk Hari Libur Ini
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto border border-gray-800 rounded-md">
            <Table>
              <TableHeader className="bg-gray-800/50 sticky top-0 z-10">
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
                  <TableHead className="text-gray-300">Nama</TableHead>
                  <TableHead className="text-gray-300">NIY</TableHead>
                  <TableHead className="text-gray-300">Divisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-gray-800">
                    <TableCell className="text-center">
                      <Checkbox
                        checked={assignSelectedIds.includes(u.id)}
                        onCheckedChange={() => toggleAssignUser(u.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {u.name}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {u.niy || "-"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {u.divisi?.name || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Kosongkan pilihan untuk berlaku ke semua pegawai.
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
              className="border-gray-700 text-gray-300 bg-red-600 hover:bg-red-700 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={handleAssignSave}
              className="bg-crimson-700 hover:bg-crimson-800 text-white"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
