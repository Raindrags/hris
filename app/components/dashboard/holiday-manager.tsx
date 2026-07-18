"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHolidayManager } from "./hooks/useHolidayManager";
import { HolidayForm } from "./subs/HolidayForm";
import { HolidayTable } from "./subs/HolidayTable";
import { HolidayAssignModal } from "./subs/HolidayAssignModal";

export function HolidayManager() {
  // Inisialisasi hook logika yang berisi semua state dan fungsi
  const logic = useHolidayManager();

  // Destructure yang dibutuhkan khusus untuk halaman ini
  const {
    holidays,
    isLoading,
    showForm,
    toggleForm,
    formState,
    setFormState,
    isEditing,
    handleSave,
    handleEdit,
    handleDelete,
    openAssignModal,
  } = logic;

  return (
    <div className="space-y-4 text-gray-100">
      <div className="flex justify-between items-center bg-gray-800/30 p-4 rounded-lg border border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Daftar Hari Libur
          </h2>
          <p className="text-sm text-gray-400">
            Kelola tanggal merah dan cuti bersama institusi.
          </p>
        </div>
        <Button
          onClick={toggleForm}
          variant={showForm ? "outline" : "default"}
          className={
            showForm
              ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              : "bg-crimson-700 hover:bg-crimson-800 text-white shadow-md shadow-crimson-900/20"
          }
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" /> Batal
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Tambah Libur
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <HolidayForm
          form={formState}
          setForm={setFormState}
          onSave={handleSave}
          isLoading={isLoading}
          isEditing={isEditing}
        />
      )}

      <HolidayTable
        data={holidays}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssign={openAssignModal}
      />

      {/* Kirim seluruh object logic ke dalam modal agar sinkron */}
      <HolidayAssignModal logic={logic} />
    </div>
  );
}
