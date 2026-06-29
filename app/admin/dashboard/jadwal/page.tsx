"use client";

import { useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HolidayManager } from "@/app/components/dashboard/holiday-manager";

// Hooks & Components Shift
import { useShiftManagement } from "./hooks/useShiftManagement";
import { useBatchAssign } from "./hooks/useBatchAssign";
import { ShiftForm } from "./components/ShiftForm";
import { ShiftTable } from "./components/ShiftTable";
import { BatchAssignModal } from "./components/BatchAssignModal";

// Hooks & Components BARU (Hari Kerja Khusus)
import { useSpecialWorkDate } from "./hooks/useSpecialWorkDate";
import { SpecialWorkDateForm } from "./components/SpecialWorkDateForm";
import { SpecialWorkDateTable } from "./components/SpecialWorkDateTable";
import { SpecialWorkDateAssignModal } from "./components/SpecialWorkDateAssignModal";

export default function PengaturanJadwalView() {
  const shiftLogic = useShiftManagement();
  const assignLogic = useBatchAssign();
  const specialDateLogic = useSpecialWorkDate(); // Memanggil logika baru

  useEffect(() => {
    shiftLogic.fetchData();
    specialDateLogic.fetchData(); // Pre-fetch data hari kerja khusus saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 text-gray-100">
      <Tabs defaultValue="shift">
        <TabsList className="flex-wrap bg-gray-900 border border-gray-800 p-1 rounded-lg">
          <TabsTrigger value="shift" className="data-[state=active]:bg-crimson-700 data-[state=active]:text-white text-gray-400">
            Template Shift
          </TabsTrigger>
          <TabsTrigger value="holiday" className="data-[state=active]:bg-crimson-700 data-[state=active]:text-white text-gray-400">
            Hari Libur
          </TabsTrigger>
          <TabsTrigger value="special" className="data-[state=active]:bg-crimson-700 data-[state=active]:text-white text-gray-400">
            Hari Kerja Khusus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shift">
          <Card className="bg-gray-900 border-gray-800 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <CardTitle className="text-white">Template Shift Kerja (Dinamis)</CardTitle>
                <CardDescription className="text-gray-400">Atur jam masuk & pulang per hari dalam satu template jadwal.</CardDescription>
              </div>
              <Button size="sm" onClick={shiftLogic.toggleForm} className="bg-crimson-700 hover:bg-crimson-800 text-white">
                {shiftLogic.showShiftForm ? <><X className="w-4 h-4 mr-2" /> Batal</> : <><Plus className="w-4 h-4 mr-2" /> Tambah Template</>}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {shiftLogic.showShiftForm && (
                <ShiftForm 
                  form={shiftLogic.shiftForm} setForm={shiftLogic.setShiftForm}
                  onDetailChange={shiftLogic.handleDetailChange} onSave={shiftLogic.handleSaveShift}
                  isLoading={shiftLogic.isLoading} isEditing={shiftLogic.isEditing}
                />
              )}
              <ShiftTable 
                shifts={shiftLogic.paginatedShifts} totalShifts={shiftLogic.shifts.length}
                isLoading={shiftLogic.isLoading} currentPage={shiftLogic.currentPage}
                totalPages={shiftLogic.totalPages} onPageChange={shiftLogic.setCurrentPage}
                onEdit={shiftLogic.handleEditShift} onDelete={shiftLogic.handleDeleteShift}
                onAssign={assignLogic.openModal}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holiday">
          <Card className="bg-gray-900 border-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Hari Libur Nasional & Perusahaan</CardTitle>
              <CardDescription className="text-gray-400">Kelola tanggal libur yang berlaku. Kosongkan pegawai untuk berlaku ke semua.</CardDescription>
            </CardHeader>
            <CardContent><HolidayManager /></CardContent>
          </Card>
        </TabsContent>

        {/* TAB TARGET: HARI KERJA KHUSUS SUDAH REFACTOR & DIPERBARUI */}
        <TabsContent value="special">
          <Card className="bg-gray-900 border-gray-800 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <CardTitle className="text-white">Hari Kerja Khusus</CardTitle>
                <CardDescription className="text-gray-400">Hari libur yang dijadikan hari kerja (misal: Sabtu/Minggu masuk karena event).</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => specialDateLogic.toggleForm()}
                className="bg-crimson-700 hover:bg-crimson-800 text-white"
              >
                {specialDateLogic.showForm ? <><X className="w-4 h-4 mr-2" /> Batal</> : <><Plus className="w-4 h-4 mr-2" /> Tambah Agenda</>}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {specialDateLogic.showForm && (
                <SpecialWorkDateForm 
                  form={specialDateLogic.formState}
                  setForm={specialDateLogic.setFormState}
                  onSave={specialDateLogic.handleSave}
                  isLoading={specialDateLogic.isLoading}
                  isEditing={specialDateLogic.isEditing}
                />
              )}

              <SpecialWorkDateTable 
                data={specialDateLogic.specialDates}
                isLoading={specialDateLogic.isLoading}
                onEdit={specialDateLogic.handleEdit}
                onDelete={specialDateLogic.handleDelete}
                onAssign={specialDateLogic.openAssignModal}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL WINDOWS */}
      <BatchAssignModal assignLogic={assignLogic} />
      <SpecialWorkDateAssignModal logic={specialDateLogic} />
    </div>
  );
}