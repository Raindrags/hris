import { Lightbulb, Navigation2, CircleDot, MapPin, Car, User, UserPlus, PackagePlus, Clock, Hourglass, Smile, Box } from 'lucide-react';

interface RideShareViewProps {
  // Tambahkan props availableRides
  availableRides: any[]; 
  // Tambahkan argumen 'id' agar modal tahu booking mana yang diklik
  openJoinModal: (id: string, target: string, vehicle: string) => void;
  openPackageModal: (id: string, target: string, vehicle: string) => void;
  activeNebeng: Array<any>;
  activePackages: Array<any>;
}

export default function RideShareView({ availableRides, openJoinModal, openPackageModal, activeNebeng, activePackages }: RideShareViewProps) {
  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Ikut Serta & Titip Pengiriman</h3>
          <p className="text-slate-500 text-sm">Tidak perlu memesan mobil baru jika sudah ada mobil yang berangkat searah. Mari hemat anggaran sekolah!</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2">
          <Lightbulb className="w-4 h-4 animate-pulse" />
          <span>Solusi Efisiensi Energi & Armada</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* KIRI: Daftar Keberangkatan (SEKARANG DINAMIS) */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2">
            <Navigation2 className="w-4 h-4" /> Keberangkatan Hari Ini
          </h4>
          
          <div className="space-y-4">
            {availableRides?.length === 0 ? (
              <div className="bg-slate-50 p-6 text-center rounded-2xl border border-dashed text-slate-500 text-sm">
                Belum ada jadwal keberangkatan yang tersedia saat ini.
              </div>
            ) : (
              availableRides.map((ride) => (
                <div key={ride.id} className="bg-white border border-slate-100 hover:border-teal-500 rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-2 h-full bg-teal-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-teal-50 text-teal-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Perjalanan Aktif</span>
                      <h5 className="font-extrabold text-slate-900 text-lg mt-1.5">{ride.destination}</h5>
                    </div>
                    {/* Menghitung sisa kursi jika ada logicnya, sementara kita tampilkan info kursi */}
                    <span className="bg-teal-50 text-teal-600 text-xs font-black px-3 py-1.5 rounded-xl border border-teal-100">
                      Jadwal: {new Date(ride.date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-500 font-semibold mb-6">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Pengaju Utama: <span>{ride.user?.name}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Berangkat: <span>{ride.timeOut} WIB</span></div>
                    <div className="flex items-center gap-2"><Car className="w-4 h-4 text-slate-400" /> Armada: <span>{ride.vehicle?.name} ({ride.vehicle?.platNumber})</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      // Mengirimkan ID juga ke modal
                      onClick={() => openJoinModal(ride.id, ride.destination, `${ride.vehicle?.name} (${ride.vehicle?.platNumber})`)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" /><span>Ikut (Nebeng)</span>
                    </button>
                    <button 
                      onClick={() => openPackageModal(ride.id, ride.destination, `${ride.vehicle?.name} (${ride.vehicle?.platNumber})`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <PackagePlus className="w-3.5 h-3.5" /><span>Titip Barang</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KANAN: Partisipasi Aktif (KITA BUAT DINAMIS JUGA) */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2">
            <Hourglass className="w-4 h-4" /> Partisipasi Aktif Anda
          </h4>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* List Tumpangan (Nebeng) */}
            <div>
              <h5 className="font-extrabold text-slate-900 text-sm mb-3">Tumpangan Saya (Nebeng)</h5>
              {activeNebeng?.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold space-y-2">
                  <Smile className="w-8 h-8 mx-auto stroke-[1.5]" />
                  <p>Belum ikut serta perjalanan hari ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeNebeng.map((item, idx) => (
                    <div key={idx} className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        {/* Menyesuaikan dengan data dari Backend */}
                        <strong className="text-teal-700 block text-sm font-extrabold">{item.booking?.destination || item.target}</strong>
                        <span className="text-slate-500 font-medium block mt-1">Turun di: {item.dropOff || item.dropoff}</span>
                      </div>
                      <span className={`font-extrabold px-2.5 py-1 rounded-lg uppercase text-[10px] ${item.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'}`}>
                        {item.status || 'Menunggu'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List Paket Dititipkan */}
            <div>
              <h5 className="font-extrabold text-slate-900 text-sm mb-3">Paket Dititipkan</h5>
              {activePackages?.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold space-y-2">
                  <Box className="w-8 h-8 mx-auto stroke-[1.5]" />
                  <p>Belum ada paket yang didelegasikan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activePackages.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        {/* Menyesuaikan dengan data dari Backend */}
                        <strong className="text-slate-900 block text-sm font-extrabold">{item.description || item.desc}</strong>
                        <span className="text-slate-500 font-medium block mt-1">
                          Penerima: {item.receiver} | Armada: {item.booking?.vehicle?.platNumber || item.vehicle}
                        </span>
                      </div>
                      <span className={`font-extrabold px-2.5 py-1 rounded-lg uppercase text-[10px] ${item.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                         {item.status === 'APPROVED' ? 'Disetujui' : 'Menunggu'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}