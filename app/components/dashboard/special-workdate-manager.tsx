"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getSpecialWorkDates,
  createSpecialWorkDate,
  updateSpecialWorkDate,
  deleteSpecialWorkDate,
} from "@/app/actions/special-workdate-action";
import { getUsers } from "@/app/actions/get-user-action";
import { getDivisions } from "@/app/actions/get-division-action";

interface SpecialWorkDate {
  id: string;
  date: string;
  reason: string | null;
  checkIn: string;
  checkOut: string;
  divisiId: string | null;
  divisi?: { name: string };
  users: { id: string; name: string; niy: string }[];
}

interface UserOption {
  id: string;
  name: string;
  niy: string;
  divisi?: { name: string };
}

interface Division {
  id: string;
  name: string;
}

export function SpecialWorkDateManager() {
  const [items, setItems] = useState<SpecialWorkDate[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
    checkIn: "07:30",
    checkOut: "16:00",
    divisiId: "all", // "all" untuk global
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    const [swRes, userRes, divRes] = await Promise.all([
      getSpecialWorkDates(),
      getUsers(),
      getDivisions(),
    ]);
    if (swRes.success) setItems(swRes.data);
    if (userRes.success) setUsers(userRes.data);
    if (divRes.success) setDivisions(divRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.date) {
      toast.error("Tanggal wajib diisi");
      return;
    }

    const payload = {
      date: formData.date,
      reason: formData.reason || undefined,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      divisiId: formData.divisiId === "all" ? null : formData.divisiId,
      userIds: selectedUserIds.length ? selectedUserIds : null,
    };

    let res;
    if (editingId) {
      res = await updateSpecialWorkDate(editingId, payload);
    } else {
      res = await createSpecialWorkDate(payload);
    }

    if (res.success) {
      toast.success(editingId ? "Data diperbarui" : "Data ditambahkan");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } else {
      toast.error(res.error || "Gagal menyimpan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
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
      reason: item.reason || "",
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      divisiId: item.divisiId || "all",
    });
    setSelectedUserIds(item.users.map((u) => u.id));
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      date: "",
      reason: "",
      checkIn: "07:30",
      checkOut: "16:00",
      divisiId: "all",
    });
    setSelectedUserIds([]);
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
              <TableHead>Alasan</TableHead>
              <TableHead>Jam Kerja</TableHead>
              <TableHead>Divisi</TableHead>
              <TableHead>Pegawai</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
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
                  <TableCell>{item.reason || "-"}</TableCell>
                  <TableCell>
                    {item.checkIn} - {item.checkOut}
                  </TableCell>
                  <TableCell>
                    {item.divisi?.name || (
                      <Badge variant="secondary">Semua Divisi</Badge>
                    )}
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
                  <TableCell className="text-right space-x-2">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "Tambah"} Hari Kerja Khusus
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
              <Label>Alasan (opsional)</Label>
              <Input
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Contoh: Pengganti libur Lebaran"
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
            <div>
              <Label>Divisi</Label>
              <Select
                value={formData.divisiId}
                onValueChange={(value) =>
                  setFormData({ ...formData, divisiId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Berlaku untuk Pegawai</Label>
              <Select
                value={selectedUserIds}
                onValueChange={setSelectedUserIds}
                multiple
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pegawai (kosongkan untuk semua di divisi)" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.niy}) - {u.divisi?.name || "-"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Kosongkan untuk berlaku ke semua pegawai dalam divisi yang
                dipilih (atau global).
              </p>
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
    </div>
  );
}
