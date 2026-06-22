import { PackagePlus, X } from 'lucide-react';
import { useState } from 'react';

interface PackageModalProps {
  target: string;
  vehicle: string;
  onClose: () => void;
  onSubmit: (desc: string, receiver: string) => void;
}

export default function PackageModal({ target, vehicle, onClose, onSubmit }: PackageModalProps) {
  const [desc, setDesc] = useState('');
  const [receiver, setReceiver] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(desc, receiver);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-slate-900" /> Delegasi Titip Barang
          </h4>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-4">Dititipkan pada perjalanan: {target}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama / Deskripsi Paket</label>
            <input 
              type="text" 
              required 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Contoh: 1 Kardus Dokumen Rapor Siswa" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Penerima di Tujuan</label>
            <input 
              type="text" 
              required 
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Contoh: Ibu Linda (Staf Tata Usaha)" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 font-medium" 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition">
            Simpan Manifest Titipan
          </button>
        </form>
      </div>
    </div>
  );
}