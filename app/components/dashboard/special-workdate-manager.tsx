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
  description?: string; // tetap dipertahankan untuk backward compatibility
  name?: string; // alternatif nama kegiatan
  checkIn?: string; // jam masuk
  checkOut?: string; // jam pulang
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

  // State assign
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

  // Assign modal functions
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Hari Kerja Khusus
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Kegiatan</TableHead>
              <TableHead>Jam</TableHead>
              <TableHead>Berlaku untuk</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Belum ada data.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{item.name || item.description || "-"}</TableCell>
                  <TableCell>
                    {item.checkIn && item.checkOut
                      ? `${item.checkIn.substring(0, 5)} - ${item.checkOut.substring(0, 5)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.users.length === 0 ? (
                      <Badge variant="secondary">Semua Pegawai</Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.users.slice(0, 2).map((u) => (
                          <Badge key={u.id} variant="outline">
                            {u.name}
                          </Badge>
                        ))}
                        {item.users.length > 2 && (
                          <Badge variant="outline">
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
                    >
                      <Users className="w-4 h-4 mr-1" /> Assign
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="w-4 h-4 text-orange-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
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

      {/* Modal Tambah/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? "Edit Hari Kerja Khusus"
                : "Tambah Hari Kerja Khusus"}
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
              <Label>Nama Kegiatan</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Masuk Sabtu karena event"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jam Masuk</Label>
                <Input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) =>
                    setFormData({ ...formData, checkIn: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Jam Pulang</Label>
                <Input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOut: e.target.value })
                  }
                />
              </div>
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

      {/* Modal Assign */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Atur Pegawai untuk Hari Kerja Khusus</DialogTitle>
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
