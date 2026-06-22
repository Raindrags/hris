import { Contact, GraduationCap, PhoneCall } from 'lucide-react';

export default function UserProfile() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl">
          BS
        </div>
        <div>
          <h2 className="font-extrabold text-lg text-slate-900">Budi Santoso, S.Pd.</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1"><Contact className="w-3.5 h-3.5" /> NIY: 198203042005</span>
            <span>•</span>
            <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Guru Akademik</span>
            <span>•</span>
            <span className="bg-teal-50 text-teal-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase">Sesi WA Aktif</span>
          </div>
        </div>
      </div>
      <div className="w-full sm:w-auto text-center sm:text-right">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Butuh Bantuan GA?</p>
        <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
          <PhoneCall className="w-4 h-4" /> Hubungi GA (WhatsApp)
        </a>
      </div>
    </div>
  );
}