"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import Komponen yang sudah dipecah
import { PegawaiTable } from "./PegawaiTable";
import { PegawaiFormModal } from "./PegawaiFormModal";

// Helper extractor
const extractArray = (responseData: any): any[] => {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData;
  if (responseData?.data?.data && Array.isArray(responseData.data.data))
    return responseData.data.data;
  if (responseData?.data && Array.isArray(responseData.data))
    return responseData.data;
  return [];
};

export default function PegawaiView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data State
  const [employees, setEmployees] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, supRes, divRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/users/supervisors"),
        fetch("/api/division"),
      ]);

      if (empRes.ok) setEmployees(extractArray(await empRes.json()));
      if (supRes.ok) setSupervisors(extractArray(await supRes.json()));
      if (divRes.ok) setDivisions(extractArray(await divRes.json()));
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus pegawai ${name}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Pegawai berhasil dihapus");
        fetchData();
      } else {
        toast.error(data.message || "Gagal menghapus pegawai");
      }
    } catch (error) {
      toast.error("Gagal menghapus pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (payload: any, editingId: string | null) => {
    setIsSaving(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          editingId
            ? "Data pegawai diupdate!"
            : "Pegawai baru berhasil ditambahkan!",
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || "Terjadi kesalahan sistem");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-md text-gray-100">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-4 gap-4">
          <div>
            <CardTitle className="text-white">Manajemen Pegawai</CardTitle>
            <CardDescription className="text-gray-400">
              Kelola data seluruh pegawai, peran (role), dan pengaturan atasan.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
            className="bg-crimson-700 hover:bg-crimson-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Pegawai
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <PegawaiTable
            employees={employees}
            supervisors={supervisors}
            isLoading={isLoading}
            onEdit={(emp) => {
              setEditingEmployee(emp);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <PegawaiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        initialData={editingEmployee}
        supervisors={supervisors}
        divisions={divisions}
      />
    </div>
  );
}
