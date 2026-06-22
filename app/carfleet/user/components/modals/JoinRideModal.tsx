import { UserPlus, X } from 'lucide-react';
import { useState } from 'react';

interface JoinRideModalProps {
  target: string;
  vehicle: string;
  onClose: () => void;
  onSubmit: (dropoff: string) => void;
}

export default function JoinRideModal({ target, vehicle, onClose, onSubmit }: JoinRideModalProps) {
  const [dropoff, setDropoff] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(dropoff);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" /> Ajukan Ikut Tumpangan
          </h4>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-4">Rute: {target} menggunakan {vehicle}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Titik Turun / Lokasi Anda</label>
            <input 
              type="text" 
              required 
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Contoh: Samping Pos Satpam Gedung 2" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 font-medium" 
            />
          </div>
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition">
            Kirim Permintaan Tumpangan
          </button>
        </form>
      </div>
    </div>
  );
}