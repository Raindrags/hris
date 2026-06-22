// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  FileClock, 
  KeyRound, 
  CarFront, 
  Wrench, 
  CalendarDays, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '../../lib/utils/api';

export default function DashboardUtamaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/dashboard/stats');
      setData(res);
    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Memuat statistik sistem GA...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    pendingApprovals: 0,
    activeReturns: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
  };

  const activities = data?.upcomingActivities || [];

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard General Affairs</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem Manajemen Kendaraan Operasional Sekolah</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 border px-3 py-2 rounded-lg bg-white text-sm font-medium hover:bg-slate-50 transition shadow-sm text-slate-700"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* METRIC GRID CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Persetujuan</span>
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.pendingApprovals}</h3>
            <Link href="/dashboard/persetujuan" className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1 mt-1">
              Lihat antrean <ArrowRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
            <FileClock size={24} />
          </div>
        </div>

        {/* CARD 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Kunci</span>
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.activeReturns}</h3>
            <Link href="/dashboard/pengembalian" className="text-xs text-indigo-600 font-medium hover:underline inline-flex items-center gap-1 mt-1">
              Validasi pengembalian <ArrowRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <KeyRound size={24} />
          </div>
        </div>

        {/* CARD 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Tersedia</span>
            <h3 className="text-3xl font-extrabold text-emerald-600">{stats.availableVehicles}</h3>
            <Link href="/dashboard/master" className="text-xs text-slate-500 font-medium hover:underline inline-flex items-center gap-1 mt-1">
              Cek master data <ArrowRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <CarFront size={24} />
          </div>
        </div>

        {/* CARD 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sedang Diservis</span>
            <h3 className="text-3xl font-extrabold text-red-600">{stats.vehiclesInMaintenance}</h3>
            <Link href="/dashboard/perawatan" className="text-xs text-red-600 font-medium hover:underline inline-flex items-center gap-1 mt-1">
              Pantau bengkel <ArrowRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
            <Wrench size={24} />
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <CalendarDays className="text-blue-600 w-5 h-5" />
          <div>
            <h2 className="font-bold text-slate-900 text-base">Jadwal Aktivitas Terdekat</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar agenda peminjaman kendaraan operasional yang telah disetujui</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activities.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Belum ada aktivitas terjadwal untuk beberapa waktu ke depan.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-600 font-medium border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Tanggal Pakai</th>
                  <th className="p-4">Peminjam</th>
                  <th className="p-4">Kendaraan Terpilih</th>
                  <th className="p-4">Tujuan Destinasi</th>
                  <th className="p-4 pr-6">Durasi Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-900">
                      {new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{act.user?.name}</td>
                    <td className="p-4">
                      <span className="inline-flex bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md font-medium">
                        {act.vehicle?.name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{act.destination}</td>
                    <td className="p-4 pr-6 text-amber-600 font-bold">
                      {act.timeOut} - {act.timeIn} WIB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}