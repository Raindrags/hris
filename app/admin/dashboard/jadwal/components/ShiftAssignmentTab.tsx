"use client";

import { useState, useEffect } from "react";
import { Save, Users, Settings, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ShiftAssignmentTabProps {
  shifts: any[];
}

const DEFAULT_DAYS = [
  {
    dayOfWeek: 1,
    dayName: "Senin",
    checkIn: "07:30",
    checkOut: "16:00",
    isActive: true,
  },
  {
    dayOfWeek: 2,
    dayName: "Selasa",
    checkIn: "07:30",
    checkOut: "16:00",
    isActive: true,
  },
  {
    dayOfWeek: 3,
    dayName: "Rabu",
    checkIn: "07:30",
    checkOut: "16:00",
    isActive: true,
  },
  {
    dayOfWeek: 4,
    dayName: "Kamis",
    checkIn: "07:30",
    checkOut: "16:00",
    isActive: true,
  },
  {
    dayOfWeek: 5,
    dayName: "Jumat",
    checkIn: "07:30",
    checkOut: "16:00",
    isActive: true,
  },
  {
    dayOfWeek: 6,
    dayName: "Sabtu",
    checkIn: "07:30",
    checkOut: "16:00",
    isActive: false,
  },
];

export function ShiftAssignmentTab({ shifts }: ShiftAssignmentTabProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State baru untuk fitur pencarian

  // Mode: "template" atau "custom"
  const [assignMode, setAssignMode] = useState<"template" | "custom">(
    "template",
  );

  // State untuk Template Mode
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");

  // State untuk Custom Mode
  const [customDays, setCustomDays] = useState(DEFAULT_DAYS);
  const [isFlexible, setIsFlexible] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
      const res = await fetch("/api/shifts/employees-for-assign");
      const data = await res.json();
      setEmployees(data.data || []);
    }
    fetchEmployees();
  }, []);

  // Filter pegawai berdasarkan input pencarian
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.jabatan &&
        emp.jabatan.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0)
      return toast.error("Pilih minimal 1 pegawai!");
    if (!effectiveDate) return toast.error("Tentukan tanggal efektif berlaku!");

    setIsLoading(true);
    try {
      if (assignMode === "template") {
        if (!selectedShiftId) return toast.error("Pilih shift jadwal baru!");
        await fetch("/api/shifts/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userIds: selectedUserIds,
            shiftId: selectedShiftId,
            effectiveDate,
          }),
        });
      } else {
        const activeDetails = customDays
          .filter((d) => d.isActive)
          .map(({ dayOfWeek, checkIn, checkOut }) => ({
            dayOfWeek,
            checkIn,
            checkOut,
          }));

        if (activeDetails.length === 0)
          return toast.error("Pilih minimal 1 hari kerja!");

        await fetch("/api/shifts/assign-custom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userIds: selectedUserIds,
            details: activeDetails,
            isFlexible,
            effectiveDate,
          }),
        });
      }

      toast.success("Perubahan jadwal berhasil disimpan!");
      setSelectedUserIds([]);
      setEffectiveDate("");
    } catch (error) {
      toast.error("Gagal menyimpan jadwal.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDayChange = (index: number, field: string, value: any) => {
    const newDays = [...customDays];
    newDays[index] = { ...newDays[index], [field]: value };
    setCustomDays(newDays);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Kolom Kiri: Pegawai */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-white flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Pilih Pegawai ({selectedUserIds.length} dipilih)
          </div>
        </Label>

        {/* Input Pencarian Pegawai */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Cari nama atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-crimson-700"
          />
        </div>

        {/* Daftar Pegawai dengan Scrollbar Custom */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg max-h-[420px] overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <label
                key={emp.id}
                className="flex items-center space-x-3 p-2.5 rounded-md cursor-pointer hover:bg-gray-700 transition"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 text-crimson-600 focus:ring-crimson-600 bg-gray-900"
                  checked={selectedUserIds.includes(emp.id)}
                  onChange={() => {
                    setSelectedUserIds((prev) =>
                      prev.includes(emp.id)
                        ? prev.filter((id) => id !== emp.id)
                        : [...prev, emp.id],
                    );
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {emp.name}
                  </p>
                  <p className="text-xs text-gray-500">{emp.jabatan || "-"}</p>
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-6 text-sm text-gray-500">
              Tidak ada pegawai yang sesuai pencarian.
            </div>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Mode & Form */}
      <div className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
          <button
            className={`flex-1 flex justify-center items-center py-2 text-sm rounded-md transition ${assignMode === "template" ? "bg-crimson-700 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
            onClick={() => setAssignMode("template")}
          >
            <FileText className="w-4 h-4 mr-2" /> Pakai Template
          </button>
          <button
            className={`flex-1 flex justify-center items-center py-2 text-sm rounded-md transition ${assignMode === "custom" ? "bg-crimson-700 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
            onClick={() => setAssignMode("custom")}
          >
            <Settings className="w-4 h-4 mr-2" /> Jadwal Personal
          </button>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
          {/* TANGGAL EFEKTIF */}
          <div className="space-y-2">
            <Label className="text-gray-300">Berlaku Mulai Tanggal</Label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white focus:border-crimson-700"
            />
          </div>

          <hr className="border-gray-700 my-4" />

          {/* MODE 1: TEMPLATE */}
          {assignMode === "template" && (
            <div className="space-y-2">
              <Label className="text-gray-300">Pilih Template Jadwal</Label>
              <select
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-crimson-700"
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
              >
                <option value="" disabled>
                  -- Pilih Template Shift --
                </option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* MODE 2: CUSTOM / PERSONAL */}
          {assignMode === "custom" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Checkbox
                  id="flex"
                  checked={isFlexible}
                  onCheckedChange={(c) => setIsFlexible(!!c)}
                />
                <Label htmlFor="flex" className="text-gray-300 cursor-pointer">
                  Jadwal Flexible
                </Label>
              </div>

              <div className="border border-gray-700 rounded-md divide-y divide-gray-700">
                {customDays.map((day, i) => (
                  <div
                    key={day.dayOfWeek}
                    className={`flex gap-4 p-3 transition-colors ${day.isActive ? "bg-gray-800" : "bg-gray-900/50"}`}
                  >
                    <div className="w-24 flex items-center gap-2">
                      <Checkbox
                        checked={day.isActive}
                        onCheckedChange={(c) =>
                          handleCustomDayChange(i, "isActive", !!c)
                        }
                      />
                      <Label
                        className={
                          day.isActive ? "text-gray-200" : "text-gray-500"
                        }
                      >
                        {day.dayName}
                      </Label>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={day.checkIn}
                        disabled={!day.isActive}
                        className={`bg-gray-900 border-gray-700 text-white focus:border-crimson-700 ${!day.isActive && "opacity-50"}`}
                        onChange={(e) =>
                          handleCustomDayChange(i, "checkIn", e.target.value)
                        }
                      />
                      <Input
                        type="time"
                        value={day.checkOut}
                        disabled={!day.isActive}
                        className={`bg-gray-900 border-gray-700 text-white focus:border-crimson-700 ${!day.isActive && "opacity-50"}`}
                        onChange={(e) =>
                          handleCustomDayChange(i, "checkOut", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-crimson-700 hover:bg-crimson-800 text-white mt-6 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />{" "}
            {isLoading ? "Menyimpan..." : "Simpan Penugasan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
