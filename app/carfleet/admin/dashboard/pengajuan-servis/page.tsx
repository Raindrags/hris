'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { useDashboard } from '@/app/carfleet/context/DashboardContext';

export default function PengajuanServisPage() {
  const { kendaraan, startService } = useDashboard();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Filter hanya kendaraan yang tersedia untuk diservis
  const mobilTersedia = kendaraan.filter((k) => k.status === 'Tersedia');

  const [formData, setFormData] = useState({
    vehicleId: '',
    date: '',
    complaint: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await startService(formData.vehicleId, formData.date, formData.complaint);
      alert('Pengajuan servis berhasil dicatat! Status mobil sekarang: Servis');
      router.push('/dashboard/master'); // Arahkan kembali ke master data atau dashboard
    } catch (error: any) {
      alert(error.message || 'Gagal mengajukan servis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Wrench className="w-6 h-6" /> Pengajuan Servis Kendaraan
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pilih Kendaraan</label>
          <select 
            required
            className="w-full border p-2 rounded"
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
          >
            <option value="">-- Pilih Kendaraan Tersedia --</option>
            {mobilTersedia.map((mobil) => (
              <option key={mobil.id} value={mobil.id}>
                {mobil.name} - {mobil.platNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Masuk Bengkel</label>
          <input 
            type="date" 
            required
            className="w-full border p-2 rounded"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Keluhan / Kerusakan</label>
          <textarea 
            required
            rows={4}
            className="w-full border p-2 rounded"
            placeholder="Contoh: AC tidak dingin dan rem bunyi..."
            value={formData.complaint}
            onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Ajukan Servis'}
        </button>
      </form>
    </div>
  );
}