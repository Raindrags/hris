// app/admin/periods/page.tsx
"use client";

import React from "react";
import { usePeriods } from "./hooks/usePeriods";
import { PeriodTable } from "./components/PeriodTable";
import { PeriodFormDialog } from "./components/PeriodFormDialog";
import { PeriodAlertDialog } from "./components/PeriodAlertDialog";

export default function AttendancePeriodPage() {
  const { states, actions } = usePeriods();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Header Halaman */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Periode Absensi</h1>
          <p className="text-slate-400 text-sm">
            Atur rentang tanggal cutoff absensi berjalan dan kunci histori bulanan.
          </p>
        </div>

        {/* Action Button & Form Modal */}
        <PeriodFormDialog
          open={states.isDialogOpen}
          onOpenChange={actions.setIsDialogOpen}
          formData={states.formData}
          setFormData={actions.setFormData}
          // ✨ Cek apakah sedang mode edit atau tambah baru
          onSubmit={states.editingId ? actions.handleUpdatePeriod : actions.handleCreatePeriod}
          submitLoading={states.submitLoading}
          isEdit={!!states.editingId} // ✨ Opsional: Untuk mengubah judul modal (Tambah vs Edit)
        />
      </div>

      {/* Tabel Data */}
      <PeriodTable 
        periods={states.periods} 
        loading={states.loading} 
        onActionTrigger={actions.triggerActionConfirmation}
        // ✨ Lempar fungsi edit dan hapus ke dalam tabel
        onEdit={actions.openEditModal} 
       onDelete={(id) => actions.triggerActionConfirmation(id, "delete")}
      />

      {/* Global Alert Confirmation */}
      <PeriodAlertDialog
        open={states.alertOpen}
        onOpenChange={actions.setAlertOpen}
        type={states.alertType}
        onConfirm={actions.executeAction}
        onCancel={() => {
          actions.setAlertOpen(false);
          actions.setSelectedPeriodId(null);
        }}
      />
    </div>
  );
}