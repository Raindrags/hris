"use client";

import { Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { usePeralihanAtasan } from "./hooks/usePeralihanAtasan";
import { PeralihanAtasanForm } from "./components/peralihanForm";
import { PeralihanAtasanTable } from "./components/peralihanTable";

export default function PeralihanAtasanView() {
  const logic = usePeralihanAtasan();

  return (
    <div className="space-y-6 text-gray-100 p-4 md:p-8">
      <Card className="bg-gray-900 border-gray-800 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <CardTitle className="text-white">Peralihan Tugas Atasan</CardTitle>
            <CardDescription className="text-gray-400">
              Alihkan tugas approval/manajemen ke atasan lain secara sementara
              (misal: saat cuti). Sistem otomatis mengembalikan ke atasan semula
              jika tanggal berakhir sudah lewat.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={logic.toggleForm}
            className="bg-crimson-700 hover:bg-crimson-800 text-white"
          >
            {logic.showForm ? (
              <>
                <X className="w-4 h-4 mr-2" /> Batal
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Tambah Peralihan
              </>
            )}
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          {logic.showForm && (
            <PeralihanAtasanForm
              form={logic.formState}
              setForm={logic.setFormState}
              supervisors={logic.supervisors}
              allUsers={logic.allUsers}
              onSave={logic.handleSave}
              isLoading={logic.isLoading}
              isEditing={logic.isEditing}
            />
          )}

          <PeralihanAtasanTable
            data={logic.data}
            isLoading={logic.isLoading}
            onEdit={logic.handleEdit}
            onDelete={logic.handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
