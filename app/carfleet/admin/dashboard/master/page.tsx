// src/app/dashboard/master/page.tsx
'use client';

import { useState } from 'react';
import { Car, Route, Plus, Power, PowerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/app/carfleet/context/DashboardContext';
import { Button } from '@/components/ui/button';

export default function MasterDataPage() {
  const { kendaraan, rutin, addVehicle, addRoutine, toggleRoutine } = useDashboard();
  
  // State untuk form Tambah Kendaraan
  const [showFormMobil, setShowFormMobil] = useState(false);
  const [formMobil, setFormMobil] = useState({ name: '', platNumber: '', capacity: 4, type: 'MPV' });

  // State untuk form Tambah Jadwal Rutin
  const [showFormRutin, setShowFormRutin] = useState(false);
  const [formRutin, setFormRutin] = useState({ vehicleId: '', route: '', days: '1,2,3,4,5', departure: '06:00' });

  const handleSimpanMobil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVehicle(formMobil);
      alert('Kendaraan berhasil ditambahkan!');
      setShowFormMobil(false);
      setFormMobil({ name: '', platNumber: '', capacity: 4, type: 'MPV' });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSimpanRutin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRoutine(formRutin);
      alert('Jadwal rutin berhasil ditambahkan!');
      setShowFormRutin(false);
      setFormRutin({ vehicleId: '', route: '', days: '1,2,3,4,5', departure: '06:00' });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-12">
      
      {/* SECTION 1: MASTER KENDARAAN */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6"> 
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Car className="text-blue-600" /> Master Kendaraan
          </h2>
          <button 
            onClick={() => setShowFormMobil(!showFormMobil)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Tambah Kendaraan
          </button>
        </div>

        {/* Form Tambah Mobil */}
        {showFormMobil && (
          <form onSubmit={handleSimpanMobil} className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Nama Mobil</label>
              <input required type="text" className="w-full border p-2 rounded text-sm bg-white" placeholder="Avanza" value={formMobil.name} onChange={e => setFormMobil({...formMobil, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Plat Nomor</label>
              <input required type="text" className="w-full border p-2 rounded text-sm bg-white" placeholder="B 1234 CD" value={formMobil.platNumber} onChange={e => setFormMobil({...formMobil, platNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Tipe</label>
              <select className="w-full border p-2 rounded text-sm bg-white" value={formMobil.type} onChange={e => setFormMobil({...formMobil, type: e.target.value})}>
                <option value="MPV">MPV</option>
                <option value="Minibus">Minibus</option>
                <option value="Pickup">Pickup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Kapasitas Kursi</label>
              <input required type="number" min="1" className="w-full border p-2 rounded text-sm bg-white" value={formMobil.capacity} onChange={e => setFormMobil({...formMobil, capacity: parseInt(e.target.value)})} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="default" className="w-full">
                Simpan
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
              </tr>
            </thead>
            <tbody>
              {(!kendaraan || kendaraan.length === 0) ? (
                <tr><td colSpan={4} className="p-4 text-center text-slate-500">Belum ada data kendaraan</td></tr>
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
          <button 
            onClick={() => setShowFormRutin(!showFormRutin)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Buat Jadwal Rutin
          </button>
        </div>

        {/* Form Tambah Jadwal */}
        {showFormRutin && (
          <form onSubmit={handleSimpanRutin} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Rute / Kegiatan</label>
              <input required type="text" className="w-full border p-2 rounded text-sm bg-white" placeholder="Antar Jemput Rute A" value={formRutin.route} onChange={e => setFormRutin({...formRutin, route: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Pilih Mobil</label>
              <select required className="w-full border p-2 rounded text-sm bg-white" value={formRutin.vehicleId} onChange={e => setFormRutin({...formRutin, vehicleId: e.target.value})}>
                <option value="">-- Pilih --</option>
                {kendaraan && kendaraan.map(k => <option key={k.id} value={k.id}>{k.name} ({k.platNumber})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Hari (1=Senin, 5=Jumat)</label>
              <input required type="text" className="w-full border p-2 rounded text-sm bg-white" placeholder="1,2,3,4,5" value={formRutin.days} onChange={e => setFormRutin({...formRutin, days: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700">Jam Berangkat</label>
              <input required type="time" className="w-full border p-2 rounded text-sm bg-white" value={formRutin.departure} onChange={e => setFormRutin({...formRutin, departure: e.target.value})} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="default" className="w-full">
                Simpan
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
                    <button 
                      onClick={() => toggleRoutine(r.id)}
                      className={`p-2 rounded-full transition-colors ${r.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      title={r.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {r.status === 'ACTIVE' ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
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