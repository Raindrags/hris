import { Contact, GraduationCap, PhoneCall } from "lucide-react";
import { cookies } from "next/headers";

export default async function UserProfile() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data")?.value;

  let user = {
    name: "Pengguna Tidak Dikenal",
    niy: "-",
    role: "PEGAWAI",
    divisi: "-",
  };

  // Parse data JSON dari cookie
  if (userDataCookie) {
    try {
      // Decode URL component jika cookie di-encode sebelumnya
      user = JSON.parse(decodeURIComponent(userDataCookie));
    } catch (error) {
      console.error("Gagal membaca cookie user_data:", error);
    }
  }

  // Fungsi pembuat Inisial Nama (Maksimal 2 huruf)
  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
        {/* Avatar Inisial Dinamis */}
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl">
          {getInitials(user.name)}
        </div>

        <div>
          {/* Nama Dinamis */}
          <h2 className="font-extrabold text-lg text-slate-900">{user.name}</h2>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-xs text-slate-500 font-semibold">
            {/* NIY Dinamis */}
            <span className="flex items-center gap-1">
              <Contact className="w-3.5 h-3.5" /> NIY: {user.niy}
            </span>
            <span>•</span>

            {/* Role / Divisi Dinamis */}
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              {user.divisi && user.divisi !== "-" ? user.divisi : user.role}
            </span>
            <span>•</span>

            <span className="bg-teal-50 text-teal-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
              Sesi WA Aktif
            </span>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto text-center sm:text-right">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
          Butuh Bantuan GA?
        </p>
        <a
          href="https://wa.me/628123456789"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
        >
          <PhoneCall className="w-4 h-4" /> Hubungi GA (WhatsApp)
        </a>
      </div>
    </div>
  );
}
