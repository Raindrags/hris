"use client";

import { useState, useEffect } from "react";
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
  getSpecialWorkDates,
  createSpecialWorkDate,
  updateSpecialWorkDate,
  deleteSpecialWorkDate,
} from "@/app/actions/special-workdate-action";
import { getUsers } from "@/app/actions/get-user-action";

interface SpecialWorkDate {
  id: string;
  date: string;
  description?: string;
  name?: string;
  checkIn?: string;
  checkOut?: string;
  users: { id: string; name: string; niy: string }[];
}

interface UserOption {
  id: string;
  name: string;
  niy: string;
  divisi?: { name: string };
}

export function SpecialWorkDateManager() {
  const [items, setItems] = useState<SpecialWorkDate[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    checkIn: "07:00",
    checkOut: "11:00",
  });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignItemId, setAssignItemId] = useState<string | null>(null);
  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    const [dateRes, userRes] = await Promise.all([
      getSpecialWorkDates(),
      getUsers(),
    ]);
    if (dateRes.success) setItems(dateRes.data);
    if (userRes.success) setUsers(userRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (
      !formData.date ||
      !formData.name ||
      !formData.checkIn ||
      !formData.checkOut
    ) {
      toast.error("Semua field wajib diisi");
      return;
    }
    const payload = {
      date: formData.date,
      reason: formData.name,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
    };
    let res;
    if (editingId) {
      res = await updateSpecialWorkDate(editingId, payload);
    } else {
      res = await createSpecialWorkDate(payload);
    }
    console.log(res);
    if (res.success) {
      toast.success(editingId ? "Data diperbarui" : "Data ditambahkan");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } else {
      toast.error(res.error || res.message || "Gagal menyimpan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus hari kerja khusus ini?")) return;
    const res = await deleteSpecialWorkDate(id);
    if (res.success) {
      toast.success("Data dihapus");
      fetchData();
    } else {
      toast.error(res.error || "Gagal menghapus");
    }
  };

  const openEdit = (item: SpecialWorkDate) => {
    setEditingId(item.id);
    setFormData({
      date: item.date,
      name: item.name || item.description || "",
      checkIn: item.checkIn || "07:00",
      checkOut: item.checkOut || "11:00",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ date: "", name: "", checkIn: "07:00", checkOut: "11:00" });
  };

  const openAssignModal = (item: SpecialWorkDate) => {
    setAssignItemId(item.id);
    setAssignSelectedIds(item.users.map((u) => u.id));
    setAssignModalOpen(true);
  };

  const handleAssignSave = async () => {
    if (!assignItemId) return;
    const res = await updateSpecialWorkDate(assignItemId, {
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

  const toggleAssignUser = (userId: string) => {
    setAssignSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

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
          <Plus className="w-4 h-4 mr-2" /> Tambah Hari Kerja Khusus
        </Button>
      </div>

      <div className="border border-gray-800 rounded-md">
        <Table>
          <TableHeader className="bg-gray-800/50">
            <TableRow>
              <TableHead className="text-gray-300">Tanggal</TableHead>
              <TableHead className="text-gray-300">Nama Kegiatan</TableHead>
              <TableHead className="text-gray-300">Jam</TableHead>
              <TableHead className="text-gray-300">Berlaku untuk</TableHead>
              <TableHead className="text-right text-gray-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  Belum ada data.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-gray-800">
                  <TableCell className="text-white">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {item.name || item.description || "-"}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {item.checkIn && item.checkOut
                      ? `${item.checkIn.substring(0, 5)} - ${item.checkOut.substring(0, 5)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.users.length === 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-gray-800 text-gray-300"
                      >
                        Semua Pegawai
                      </Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.users.slice(0, 2).map((u) => (
                          <Badge
                            key={u.id}
                            variant="outline"
                            className="border-gray-700 text-gray-300"
                          >
                            {u.name}
                          </Badge>
                        ))}
                        {item.users.length > 2 && (
                          <Badge
                            variant="outline"
                            className="border-gray-700 text-gray-300"
                          >
                            +{item.users.length - 2} lainnya
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignModal(item)}
                      className="border-blue-800 bg-blue-900/20 text-blue-300 hover:bg-blue-900/40"
                    >
                      <Users className="w-4 h-4 mr-1" /> Assign
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="w-4 h-4 text-amber-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId
                ? "Edit Hari Kerja Khusus"
                : "Tambah Hari Kerja Khusus"}
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
              <Label className="text-gray-300">Nama Kegiatan</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Masuk Sabtu karena event"
                className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Jam Masuk</Label>
                <Input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) =>
                    setFormData({ ...formData, checkIn: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
                />
              </div>
              <div>
                <Label className="text-gray-300">Jam Pulang</Label>
                <Input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOut: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-gray-100 focus:border-crimson-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-700 text-gray-300 bg-red-600 hover:bg-red-700 hover:text-white"
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
              Atur Pegawai untuk Hari Kerja Khusus
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
              className="border-gray-700 bg-red-600 text-gray-300 hover:bg-red-700 hover:text-white"
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
