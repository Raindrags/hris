"use client";

import { Plus } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { HolidayTable } from "../table/holiday-table";
import { useHolidayManager } from "./hooks/useHolidayManager";

export function HolidayManager() {
  const {
    holidays,
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
  } = useHolidayManager();

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

      {/* DIALOG TAMBAH/EDIT */}
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

      {/* DIALOG PENUGASAN PEGAWAI */}
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
