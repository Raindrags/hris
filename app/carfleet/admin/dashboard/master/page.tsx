// src/app/dashboard/master/page.tsx
'use client';

import { useState } from 'react';
import { Car, Route, Plus, Power, PowerOff, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/app/carfleet/context/DashboardContext';
import { Button } from '@/components/ui/button';

export default function MasterDataPage() {
  const { 
    kendaraan, rutin, 
    addVehicle, updateVehicle, deleteVehicle,
    addRoutine, updateRoutine, deleteRoutine, toggleRoutine 
  } = useDashboard();
  
  // State untuk form Tambah/Edit Kendaraan
  const [showFormMobil, setShowFormMobil] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [formMobil, setFormMobil] = useState({ name: '', platNumber: '', capacity: 4, type: 'MPV' });

  // State untuk form Tambah/Edit Jadwal Rutin
  const [showFormRutin, setShowFormRutin] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [formRutin, setFormRutin] = useState({ vehicleId: '', route: '', days: '1,2,3,4,5', departure: '06:00' });

  // --- HANDLER KENDARAAN ---
  const handleSimpanMobil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, formMobil);
        alert('Kendaraan berhasil diperbarui!');
      } else {
        await addVehicle(formMobil);
        alert('Kendaraan berhasil ditambahkan!');
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
    if (confirm('Yakin ingin menghapus kendaraan ini?')) {
      try {
        await deleteVehicle(id);
        alert('Kendaraan berhasil dihapus!');
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const resetFormMobil = () => {
    setShowFormMobil(false);
    setEditingVehicleId(null);
    setFormMobil({ name: '', platNumber: '', capacity: 4, type: 'MPV' });
  };

  // --- HANDLER JADWAL RUTIN ---
  const handleSimpanRutin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoutineId) {
        await updateRoutine(editingRoutineId, formRutin);
        alert('Jadwal rutin berhasil diperbarui!');
      } else {
        await addRoutine(formRutin);
        alert('Jadwal rutin berhasil ditambahkan!');
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
    if (confirm('Yakin ingin menghapus jadwal rutin ini?')) {
      try {
        await deleteRoutine(id);
        alert('Jadwal rutin berhasil dihapus!');
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const resetFormRutin = () => {
    setShowFormRutin(false);
    setEditingRoutineId(null);
    setFormRutin({ vehicleId: '', route: '', days: '1,2,3,4,5', departure: '06:00' });
  };

  return (
    <div className="p-6 flex flex-col gap-12">
      
      {/* SECTION 1: MASTER KENDARAAN */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6"> 
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Car className="text-blue-600" /> Master Kendaraan
          </h2>
          {!showFormMobil && (
            <button 
              onClick={() => setShowFormMobil(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} /> Tambah Kendaraan
            </button>
          )}
        </div>

        {/* Form Tambah/Edit Mobil */}
        {showFormMobil && (
          <form onSubmit={handleSimpanMobil} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-6">
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                {editingVehicleId ? '✏️ Edit Data Kendaraan' : '✨ Tambah Kendaraan Baru'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Nama Mobil</label>
                <input required type="text" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Avanza" value={formMobil.name} onChange={e => setFormMobil({...formMobil, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Plat Nomor</label>
                <input required type="text" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="B 1234 CD" value={formMobil.platNumber} onChange={e => setFormMobil({...formMobil, platNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Tipe</label>
                <select className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formMobil.type} onChange={e => setFormMobil({...formMobil, type: e.target.value})}>
                  <option value="MPV">MPV</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Pickup">Pickup</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Kapasitas Kursi</label>
                <input required type="number" min="1" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formMobil.capacity} onChange={e => setFormMobil({...formMobil, capacity: parseInt(e.target.value)})} />
              </div>
            </div>

            {/* Area Tombol Terpisah */}
            <div className="flex justify-end gap-3 mt-6 pt-2">
              <Button type="button" variant="outline" className="w-full md:w-auto px-6" onClick={resetFormMobil}>
                Batal
              </Button>
              <Button type="submit" className={`w-full md:w-auto px-6 ${editingVehicleId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingVehicleId ? 'Simpan Perubahan' : 'Simpan Kendaraan'}
              </Button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-700">Nama Kendaraan</th>
                <th className="p-4 font-semibold text-slate-700">Plat Nomor</th>
                <th className="p-4 font-semibold text-slate-700">Spesifikasi</th>
                <th className="p-4 font-semibold text-slate-700">Status Saat Ini</th>
                <th className="p-4 font-semibold text-center text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(!kendaraan || kendaraan.length === 0) ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 bg-slate-50/50">Belum ada data kendaraan</td></tr>
              ) : kendaraan.map(k => (
                <tr key={k.id} className="border-b hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{k.name}</td>
                  <td className="p-4"><Badge variant="outline">{k.platNumber}</Badge></td>
                  <td className="p-4 text-slate-500">{k.type} • {k.capacity} Seat</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      k.status === 'Tersedia' ? 'bg-green-100 text-green-700' :
                      k.status === 'Dipakai' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEditMobil(k)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteMobil(k.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: JADWAL RUTIN */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Route className="text-indigo-600" /> Jadwal Rutin Operasional
          </h2>
          {!showFormRutin && (
            <button 
              onClick={() => setShowFormRutin(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} /> Buat Jadwal Rutin
            </button>
          )}
        </div>

        {/* Form Tambah/Edit Jadwal */}
        {showFormRutin && (
          <form onSubmit={handleSimpanRutin} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-6">
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                {editingRoutineId ? '✏️ Edit Jadwal Rutin' : '✨ Buat Jadwal Rutin Baru'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Rute / Kegiatan</label>
                <input required type="text" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Antar Jemput Rute A" value={formRutin.route} onChange={e => setFormRutin({...formRutin, route: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Pilih Mobil</label>
                <select required className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formRutin.vehicleId} onChange={e => setFormRutin({...formRutin, vehicleId: e.target.value})}>
                  <option value="">-- Pilih Kendaraan --</option>
                  {kendaraan && kendaraan.map(k => <option key={k.id} value={k.id}>{k.name} ({k.platNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Hari (1=Senin, 5=Jumat)</label>
                <input required type="text" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="1,2,3,4,5" value={formRutin.days} onChange={e => setFormRutin({...formRutin, days: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-600">Jam Berangkat</label>
                <input required type="time" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formRutin.departure} onChange={e => setFormRutin({...formRutin, departure: e.target.value})} />
              </div>
            </div>

            {/* Area Tombol Terpisah */}
            <div className="flex justify-end gap-3 mt-6 pt-2">
              <Button type="button" variant="outline" className="w-full md:w-auto px-6" onClick={resetFormRutin}>
                Batal
              </Button>
              <Button type="submit" className={`w-full md:w-auto px-6 ${editingRoutineId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {editingRoutineId ? 'Simpan Perubahan' : 'Simpan Jadwal'}
              </Button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-700">Rute Operasional</th>
                <th className="p-4 font-semibold text-slate-700">Kendaraan</th>
                <th className="p-4 font-semibold text-slate-700">Hari & Jam</th>
                <th className="p-4 font-semibold text-slate-700">Status</th>
                <th className="p-4 font-semibold text-center text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(!rutin || rutin.length === 0) ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 bg-slate-50/50">Belum ada jadwal rutin yang terdaftar</td></tr>
              ) : rutin.map(r => (
                <tr key={r.id} className="border-b hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{r.route}</td>
                  <td className="p-4 text-slate-700">{r.vehicle?.name} <span className="text-xs text-slate-500 ml-1">({r.vehicle?.platNumber})</span></td>
                  <td className="p-4 text-slate-700">Hari: {r.days} <br/><span className="text-amber-600 font-bold">{r.departure} WIB</span></td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {r.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => toggleRoutine(r.id)}
                        className={`p-2 rounded-full transition-colors ${r.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        title={r.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {r.status === 'ACTIVE' ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      <button onClick={() => handleEditRutin(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteRutin(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}