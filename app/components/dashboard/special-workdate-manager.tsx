"use client";

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
import { useSpecialWorkDateManager } from "./hooks/useSpecialWorkDateManager";

export function SpecialWorkDateManager() {
  const {
    items,
    users,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingId,
    formData,
    setFormData,
    assignModalOpen,
    setAssignModalOpen,
    assignSelectedIds,
    setAssignSelectedIds,
    handleSave,
    handleDelete,
    openEdit,
    resetForm,
    openAssignModal,
    handleAssignSave,
    toggleAssignUser,
  } = useSpecialWorkDateManager();

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

      {/* DIALOG TAMBAH/EDIT */}
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

      {/* DIALOG PENUGASAN PEGAWAI */}
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
