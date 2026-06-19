"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Contact, GraduationCap, Loader2, PhoneCall } from "lucide-react";

import { UserTopbar } from "./UserTopbar";
import { BookingTab, NebengTab, StatusTab } from "./UserTabs";
import { BookingModal, JoinModal, TitipModal, ReturnModal } from "./UserModals";

// ==========================================
// DEFINISI INTERFACE TYPESCRIPT
// ==========================================
export interface Vehicle { id: string; name: string; platNumber: string; }
export interface TripContext { id: string; name: string; fleet?: string; }
export interface BookingHistory { id: string; destination: string; date: string; status: string; vehicle?: { name: string; platNumber: string; }; }
export interface NebengItem { tripName?: string; dropOff: string; seats: string; status: string; }
export interface PackageItem { tripName?: string; description: string; receiver: string; status: string; }

// Interface Profil Dinamis
export interface UserProfile { name: string; initials: string; role: string; identifier: string; }

export default function UserPortalView() {
  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">("booking");
  const [selectedFleet, setSelectedFleet] = useState<number | string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk menyimpan Token Magic Link
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isTitipOpen, setIsTitipOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [activeTripContext, setActiveTripContext] = useState<TripContext | null>(null);

  // States Data dari API
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [nebengList, setNebengList] = useState<NebengItem[]>([]); 
  const [packageList, setPackageList] = useState<PackageItem[]>([]); 
  const [historyList, setHistoryList] = useState<BookingHistory[]>([]);

  // 1. Fetch Inisial & Ambil Token dari URL
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Ambil token dari URL Browser (contoh: domain.com/?token=xyz)
        const urlParams = new URLSearchParams(window.location.search);
        const magicToken = urlParams.get('token');
        
        if (magicToken) {
          setAuthToken(magicToken);
        }

        // Siapkan Headers dan URL khusus untuk profile
        const headers = magicToken ? { 'Authorization': `Bearer ${magicToken}` } : {};
        const profileUrl = magicToken 
          ? `/api/ga/user/profile?token=${magicToken}` 
          : `/api/ga/user/profile`;

        const [resVehicles, resProfile, resNebengs, resPackages] = await Promise.all([
          fetch("/api/ga/vehicles", { headers }),
          fetch(profileUrl, { headers }), 
          fetch("/api/ga/nebeng/my-list", { headers }), 
          fetch("/api/ga/titip/my-list", { headers })
        ]);

        // Parsing hanya jika respons OK untuk mencegah error JSON
        const jsonVehicles = resVehicles.ok ? await resVehicles.json() : { success: false };
        const jsonProfile = resProfile.ok ? await resProfile.json() : { success: false };
        const jsonNebengs = resNebengs.ok ? await resNebengs.json() : { success: false };
        const jsonPackages = resPackages.ok ? await resPackages.json() : { success: false };

        if (jsonVehicles.success) setVehicles(jsonVehicles.data);
        if (jsonProfile.success) setUserProfile(jsonProfile.data);
        if (jsonNebengs.success) setNebengList(jsonNebengs.data);
        if (jsonPackages.success) setPackageList(jsonPackages.data);

      } catch (error) {
        console.error("Gagal mengambil data inisial", error);
        toast.error("Gagal terhubung ke server untuk sinkronisasi data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch riwayat saat tab status aktif
  useEffect(() => {
    if (activeTab === "status") {
      const fetchHistory = async () => {
        try {
          const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
          const res = await fetch("/api/ga/bookings", { headers });
          if (res.ok) {
            const json = await res.json();
            if (json.success) setHistoryList(json.data);
          }
        } catch (error) {
          console.error("Gagal mengambil riwayat", error);
        }
      };
      fetchHistory();
    }
  }, [activeTab, authToken]);

  // ==========================================
  // HANDLERS SUBMIT API
  // ==========================================
  const submitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      vehicleId: selectedFleet, date: selectedDate,
      destination: formData.get("destination") as string,
      timeOut: formData.get("timeOut") as string,
      timeIn: formData.get("timeIn") as string,
      passengers: formData.get("passengers") as string,
    };

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch("/api/ga/bookings", {
        method: "POST", 
        headers,
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(result.message || "Pengajuan sewa armada berhasil dikirim!");
        setIsBookingOpen(false);
        setActiveTab("status");
      } else toast.error(result.message || "Gagal mengajukan peminjaman.");
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const submitJoinRide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dropOff = formData.get("dropOff") as string;
    const seats = formData.get("seats") as string;

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch("/api/ga/nebeng", {
        method: "POST", 
        headers,
        body: JSON.stringify({ tripId: activeTripContext?.id, dropOff, seats }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(result.message || "Notifikasi terkirim ke supir.");
        setIsJoinOpen(false);
        setNebengList(prev => [...prev, { tripName: activeTripContext?.name, dropOff, seats, status: "Menunggu Driver" }]);
      } else toast.error(result.message || "Gagal mengajukan nebeng.");
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const submitTitipBarang = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get("itemDesc") as string;
    const receiver = formData.get("receiver") as string;

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch("/api/ga/titip", {
        method: "POST", 
        headers,
        body: JSON.stringify({ tripId: activeTripContext?.id, itemDesc: description, receiver }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(result.message || "Barang tercatat di log penitipan.");
        setIsTitipOpen(false);
        setPackageList(prev => [...prev, { tripName: activeTripContext?.name, description, receiver, status: "Di Tangan Driver" }]);
      } else toast.error(result.message || "Gagal mencatat titipan.");
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const confirmReturn = async () => {
    setIsReturnOpen(false);
    toast.success("Pengembalian dilaporkan! Menunggu verifikasi fisik oleh GA.");
    // Catatan: Anda bisa menambahkan blok fetch ke "/api/portal/bookings/return" di sini jika endpoint-nya sudah siap.
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#fcfbf9] text-slate-800 min-h-screen flex flex-col font-sans selection:bg-teal-100">
      <UserTopbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Banner Profil Dinamis */}
        {userProfile ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl uppercase">
                {userProfile.initials}
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-[#1a365d]">{userProfile.name}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Contact className="w-3.5 h-3.5" /> NIY: {userProfile.identifier}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {userProfile.role}</span>
                </div>
              </div>
            </div>
            <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2">
              <PhoneCall className="w-4 h-4" /> Hubungi GA
            </a>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 text-center text-slate-500 text-sm">Gagal memuat profil pengguna.</div>
        )}

        {/* Tab Konten */}
        {activeTab === "booking" && (
          <BookingTab vehicles={vehicles} selectedFleet={selectedFleet} setSelectedFleet={setSelectedFleet} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onOpenBookingModal={() => setIsBookingOpen(true)} />
        )}
        {activeTab === "nebeng" && (
          <NebengTab nebengList={nebengList} packageList={packageList} onOpenJoinModal={(trip: TripContext) => { setActiveTripContext(trip); setIsJoinOpen(true); }} onOpenTitipModal={(trip: TripContext) => { setActiveTripContext(trip); setIsTitipOpen(true); }} />
        )}
        {activeTab === "status" && (
          <StatusTab historyList={historyList} onOpenReturnModal={() => setIsReturnOpen(true)} />
        )}
      </main>

      {/* Modals */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} onSubmit={submitBooking} />
      <JoinModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} onSubmit={submitJoinRide} activeTrip={activeTripContext} />
      <TitipModal isOpen={isTitipOpen} onClose={() => setIsTitipOpen(false)} onSubmit={submitTitipBarang} activeTrip={activeTripContext} />
      <ReturnModal isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} onConfirm={confirmReturn} />
    </div>
  );
}