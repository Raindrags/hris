import { BusFront, CalendarRange, Users, CheckSquare } from 'lucide-react';

interface PortalNavbarProps {
  activeTab: 'booking' | 'nebeng' | 'status';
  setActiveTab: (tab: 'booking' | 'nebeng' | 'status') => void;
}

export default function PortalNavbar({ activeTab, setActiveTab }: PortalNavbarProps) {
  const getTabClass = (tabName: string) => 
    activeTab === tabName 
      ? "flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 bg-white text-slate-900 shadow-sm"
      : "flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 transition-all duration-300";

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4 md:gap-0">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 flex items-center justify-center rounded-2xl border border-teal-100">
              <BusFront className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">SekolahApp</h1>
              <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Portal Guru & Karyawan</span>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 w-full md:w-auto">
            <button onClick={() => setActiveTab('booking')} className={getTabClass('booking')}>
              <CalendarRange className="w-4 h-4" /> <span>Pesan Sendiri</span>
            </button>
            <button onClick={() => setActiveTab('nebeng')} className={getTabClass('nebeng')}>
              <Users className="w-4 h-4" /> <span>Ikut Serta & Titip</span>
            </button>
            <button onClick={() => setActiveTab('status')} className={getTabClass('status')}>
              <CheckSquare className="w-4 h-4" /> <span>Status Saya</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}