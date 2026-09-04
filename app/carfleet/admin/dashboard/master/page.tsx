// src/app/dashboard/master/page.tsx
"use client";

import { useState } from "react";
import {
  Car,
  Route,
  Plus,
  Power,
  PowerOff,
  Edit,
  Trash2,
  PlusCircle,
  Edit2,
  Calendar,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/app/carfleet/context/DashboardContext";

const DAY_OPTIONS = [
  { id: "1", name: "Senin" },
  { id: "2", name: "Selasa" },
  { id: "3", name: "Rabu" },
  { id: "4", name: "Kamis" },
  { id: "5", name: "Jumat" },
  { id: "6", name: "Sabtu" },
  { id: "7", name: "Minggu" },
];

export default function MasterDataPage() {
  const {
    kendaraan,
    rutin,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutine,
  } = useDashboard();

  // State untuk form Tambah/Edit Kendaraan
  const [showFormMobil, setShowFormMobil] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [formMobil, setFormMobil] = useState({
    name: "",
    platNumber: "",
    capacity: 4,
    type: "MPV",
  });

  // State untuk form Tambah/Edit Jadwal Rutin
  const [showFormRutin, setShowFormRutin] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [formRutin, setFormRutin] = useState({
    vehicleId: "",
    route: "",
    days: "1,2,3,4,5",
    departure: "06:00",
  });

  // State untuk Modal Pilihan Hari
  const [isDaysModalOpen, setIsDaysModalOpen] = useState(false);
  const [tempDays, setTempDays] = useState<string[]>([]);

  // --- HANDLER KENDARAAN ---
  const handleSimpanMobil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, formMobil);
        alert("Kendaraan berhasil diperbarui!");
      } else {
        await addVehicle(formMobil);
        alert("Kendaraan berhasil ditambahkan!");
      }
      resetFormMobil();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditMobil = (mobil: any) => {
    setFormMobil({
      name: mobil.name,
      platNumber: mobil.platNumber,
      capacity: mobil.capacity,
      type: mobil.type,
    });
    setEditingVehicleId(mobil.id);
    setShowFormMobil(true);
  };

  const handleDeleteMobil = async (id: string) => {
    if (confirm("Yakin ingin menghapus kendaraan ini?")) {
      try {
        await deleteVehicle(id);
        alert("Kendaraan berhasil dihapus!");
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const resetFormMobil = () => {
    setShowFormMobil(false);
    setEditingVehicleId(null);
    setFormMobil({ name: "", platNumber: "", capacity: 4, type: "MPV" });
  };

  // --- HANDLER JADWAL RUTIN ---
  const handleSimpanRutin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRutin.days) {
      alert("Harap pilih minimal satu hari operasional!");
      return;
    }

    try {
      if (editingRoutineId) {
        await updateRoutine(editingRoutineId, formRutin);
        alert("Jadwal rutin berhasil diperbarui!");
      } else {
        await addRoutine(formRutin);
        alert("Jadwal rutin berhasil ditambahkan!");
      }
      resetFormRutin();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditRutin = (rutinData: any) => {
    setFormRutin({
      vehicleId: rutinData.vehicleId,
      route: rutinData.route,
      days: rutinData.days,
      departure: rutinData.departure,
    });
    setEditingRoutineId(rutinData.id);
    setShowFormRutin(true);
  };

  const handleDeleteRutin = async (id: string) => {
    if (confirm("Yakin ingin menghapus jadwal rutin ini?")) {
      try {
        await deleteRoutine(id);
        alert("Jadwal rutin berhasil dihapus!");
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const resetFormRutin = () => {
    setShowFormRutin(false);
    setEditingRoutineId(null);
    setFormRutin({
      vehicleId: "",
      route: "",
      days: "1,2,3,4,5",
      departure: "06:00",
    });
  };

  // --- HANDLER MODAL HARI ---
  const openDaysModal = () => {
    setTempDays(formRutin.days ? formRutin.days.split(",") : []);
    setIsDaysModalOpen(true);
  };

  const toggleDay = (dayId: string) => {
    setTempDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((id) => id !== dayId);
      }
      return [...prev, dayId].sort();
    });
  };

  const saveDays = () => {
    setFormRutin({ ...formRutin, days: tempDays.join(",") });
    setIsDaysModalOpen(false);
  };

  const getDaysDisplayText = (daysStr: string) => {
    if (!daysStr) return "Pilih Hari Operasional";
    const daysArr = daysStr.split(",");
    if (daysArr.length === 7) return "Setiap Hari (Senin - Minggu)";

    const dayNames = daysArr
      .map((d) => DAY_OPTIONS.find((opt) => opt.id === d)?.name)
      .filter(Boolean);
    if (dayNames.length > 3) return `${dayNames.length} Hari Terpilih`;
    return dayNames.join(", ");
  };

  return (
    <div className="p-6 flex flex-col gap-12">
      {/* SECTION 1: MASTER KENDARAAN */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Car className="text-blue-600" /> Master Kendaraan
          </h2>
          {!showFormMobil && (
            <Button
              onClick={() => setShowFormMobil(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus size={16} /> Tambah Kendaraan
            </Button>
          )}
        </div>

        {/* Form Tambah/Edit Mobil */}
        {showFormMobil && (
          <form
            onSubmit={handleSimpanMobil}
            className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-6"
          >
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                {editingVehicleId ? (
                  <>
                    <Edit2 size={18} className="text-amber-500" /> Edit Data
                    Kendaraan
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} className="text-blue-500" /> Tambah
                    Kendaraan Baru
                  </>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Nama Mobil
                </label>
                <Input
                  required
                  placeholder="Avanza"
                  value={formMobil.name}
                  onChange={(e) =>
                    setFormMobil({ ...formMobil, name: e.target.value })
                  }
                  className="text-slate-900 bg-slate-50 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Plat Nomor
                </label>
                <Input
                  required
                  placeholder="B 1234 CD"
                  value={formMobil.platNumber}
                  onChange={(e) =>
                    setFormMobil({ ...formMobil, platNumber: e.target.value })
                  }
                  className="text-slate-900 bg-slate-50 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Tipe
                </label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                  value={formMobil.type}
                  onChange={(e) =>
                    setFormMobil({ ...formMobil, type: e.target.value })
                  }
                >
                  <option value="MPV">MPV</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Pickup">Pickup</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Kapasitas Kursi
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={formMobil.capacity}
                  onChange={(e) =>
                    setFormMobil({
                      ...formMobil,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="text-slate-900 bg-slate-50 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto px-6 text-slate-700 border-slate-300 hover:bg-slate-100"
                onClick={resetFormMobil}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className={`w-full md:w-auto px-6 text-white ${editingVehicleId ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {editingVehicleId ? "Simpan Perubahan" : "Simpan Kendaraan"}
              </Button>
            </div>
          </form>
        )}

        {/* Custom Scrollbar Table Kendaraan */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 pb-2">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-700">
                  Nama Kendaraan
                </th>
                <th className="p-4 font-semibold text-slate-700">Plat Nomor</th>
                <th className="p-4 font-semibold text-slate-700">
                  Spesifikasi
                </th>
                <th className="p-4 font-semibold text-slate-700">
                  Status Saat Ini
                </th>
                <th className="p-4 font-semibold text-center text-slate-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {!kendaraan || kendaraan.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-500 bg-slate-50/50"
                  >
                    Belum ada data kendaraan
                  </td>
                </tr>
              ) : (
                kendaraan.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-900">{k.name}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-slate-700">
                        {k.platNumber}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600">
                      {k.type} • {k.capacity} Seat
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          k.status === "Tersedia"
                            ? "bg-green-100 text-green-700"
                            : k.status === "Dipakai"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditMobil(k)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMobil(k.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: JADWAL RUTIN */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Route className="text-indigo-600" /> Jadwal Rutin Operasional
          </h2>
          {!showFormRutin && (
            <Button
              onClick={() => setShowFormRutin(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Plus size={16} /> Buat Jadwal Rutin
            </Button>
          )}
        </div>

        {/* Form Tambah/Edit Jadwal */}
        {showFormRutin && (
          <form
            onSubmit={handleSimpanRutin}
            className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-6"
          >
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                {editingRoutineId ? (
                  <>
                    <Edit2 size={18} className="text-amber-500" /> Edit Jadwal
                    Rutin
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} className="text-indigo-500" /> Buat
                    Jadwal Rutin Baru
                  </>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Rute / Kegiatan
                </label>
                <Input
                  required
                  placeholder="Antar Jemput Rute A"
                  value={formRutin.route}
                  onChange={(e) =>
                    setFormRutin({ ...formRutin, route: e.target.value })
                  }
                  className="text-slate-900 bg-slate-50 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Pilih Mobil
                </label>
                <select
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                  value={formRutin.vehicleId}
                  onChange={(e) =>
                    setFormRutin({ ...formRutin, vehicleId: e.target.value })
                  }
                >
                  <option value="">-- Pilih Kendaraan --</option>
                  {kendaraan &&
                    kendaraan.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.platNumber})
                      </option>
                    ))}
                </select>
              </div>

              {/* TOMBOL PEMICU MODAL HARI */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Pilih Hari
                </label>
                <div
                  onClick={openDaysModal}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all focus-within:ring-2 focus-within:ring-indigo-500"
                >
                  <span
                    className={`truncate ${formRutin.days ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {getDaysDisplayText(formRutin.days)}
                  </span>
                  <Calendar
                    size={16}
                    className="text-slate-500 flex-shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Jam Berangkat
                </label>
                <Input
                  required
                  type="time"
                  value={formRutin.departure}
                  onChange={(e) =>
                    setFormRutin({ ...formRutin, departure: e.target.value })
                  }
                  className="text-slate-900 bg-slate-50 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto px-6 text-slate-700 border-slate-300 hover:bg-slate-100"
                onClick={resetFormRutin}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className={`w-full md:w-auto px-6 text-white ${editingRoutineId ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {editingRoutineId ? "Simpan Perubahan" : "Simpan Jadwal"}
              </Button>
            </div>
          </form>
        )}

        {/* Custom Scrollbar Table Rutin */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 pb-2">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-700">
                  Rute Operasional
                </th>
                <th className="p-4 font-semibold text-slate-700">Kendaraan</th>
                <th className="p-4 font-semibold text-slate-700">Hari & Jam</th>
                <th className="p-4 font-semibold text-slate-700">Status</th>
                <th className="p-4 font-semibold text-center text-slate-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {!rutin || rutin.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-500 bg-slate-50/50"
                  >
                    Belum ada jadwal rutin yang terdaftar
                  </td>
                </tr>
              ) : (
                rutin.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-900">
                      {r.route}
                    </td>
                    <td className="p-4 text-slate-700">
                      {r.vehicle?.name}{" "}
                      <span className="text-xs text-slate-500 ml-1">
                        ({r.vehicle?.platNumber})
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">
                      Hari: {getDaysDisplayText(r.days)} <br />
                      <span className="text-amber-600 font-bold">
                        {r.departure} WIB
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${r.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {r.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleRoutine(r.id)}
                          className={`p-2 rounded-full transition-colors ${r.status === "ACTIVE" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                          title={
                            r.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"
                          }
                        >
                          {r.status === "ACTIVE" ? (
                            <PowerOff size={16} />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditRutin(r)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRutin(r.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL PILIH HARI */}
      {isDaysModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500" /> Pilih Hari
                Operasional
              </h3>
              <button
                onClick={() => setIsDaysModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {DAY_OPTIONS.map((day) => (
                <label
                  key={day.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    tempDays.includes(day.id)
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    checked={tempDays.includes(day.id)}
                    onChange={() => toggleDay(day.id)}
                  />
                  <span
                    className={`text-sm font-medium ${tempDays.includes(day.id) ? "text-indigo-900" : "text-slate-700"}`}
                  >
                    {day.name}
                  </span>
                </label>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDaysModalOpen(false)}
                className="text-slate-700 border-slate-300"
              >
                Batal
              </Button>
              <Button
                onClick={saveDays}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Simpan Pilihan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
