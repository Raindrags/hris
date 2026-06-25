"use client";

import { Contact, GraduationCap, PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserProfile() {
  // 1. Set state awal (default) untuk mencegah hydration mismatch
  const [user, setUser] = useState({
    name: "Memuat data...",
    niy: "-",
    role: "PEGAWAI",
    divisi: "-",
  });

  // 2. Baca cookie HANYA saat komponen sudah dimuat di browser
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const userDataCookie = getCookie("user_data");

    if (userDataCookie) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
        setUser({
          name: parsedUser.name || "Pengguna",
          niy: parsedUser.niy || "-",
          role: parsedUser.role || "PEGAWAI",
          divisi: parsedUser.divisi || "-",
        });
      } catch (error) {
        console.error("Gagal membaca cookie user_data:", error);
        setUser((prev) => ({ ...prev, name: "Gagal memuat data" }));
      }
    } else {
      setUser((prev) => ({ ...prev, name: "Guest" }));
    }
  }, []);

  // 3. Fungsi pembuat Inisial Nama
  const getInitials = (name: string) => {
    if (
      name === "Memuat data..." ||
      name === "Guest" ||
      name === "Gagal memuat data"
    )
      return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
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
          href="https://wa.me/6282364441014"
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
