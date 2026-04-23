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
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/app/actions/holiday-action";
import { getUsers } from "@/app/actions/get-user-action";

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

  const fetchData = async () => {
    setIsLoading(true);
    const [holidayRes, userRes] = await Promise.all([
      getHolidays(),
      getUsers(),
    ]);
    if (holidayRes.success) setHolidays(holidayRes.data);
    if (userRes.success) setUsers(userRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.date || !formData.description) {
      toast.error("Tanggal dan deskripsi wajib diisi");
      return;
    }

    const payload = {
      ...formData,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus hari libur ini?")) return;
    const res = await deleteHoliday(id);
    if (res.success) {
      toast.success("Libur dihapus");
      fetchData();
    } else {
      toast.error(res.error || "Gagal menghapus");
    }
  };

  const openEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);
    setFormData({
      date: holiday.date,
      description: holiday.description,
    });
    setSelectedUserIds(holiday.users.map((u) => u.id));
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ date: "", description: "" });
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
          <Plus className="w-4 h-4 mr-2" /> Tambah Hari Libur
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Berlaku untuk</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Belum ada data hari libur.
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    {new Date(h.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{h.description}</TableCell>
                  <TableCell>
                    {h.users.length === 0 ? (
                      <Badge variant="secondary">Semua Pegawai</Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {h.users.slice(0, 2).map((u) => (
                          <Badge key={u.id} variant="outline">
                            {u.name}
                          </Badge>
                        ))}
                        {h.users.length > 2 && (
                          <Badge variant="outline">
                            +{h.users.length - 2} lainnya
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(h)}
                    >
                      <Pencil className="w-4 h-4 text-orange-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(h.id)}
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
            <div>
              <Label>Berlaku untuk Pegawai</Label>
              <Select
                value={selectedUserIds}
                onValueChange={setSelectedUserIds}
                multiple
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pegawai (kosongkan untuk semua)" />
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
                Kosongkan untuk berlaku ke semua pegawai.
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
