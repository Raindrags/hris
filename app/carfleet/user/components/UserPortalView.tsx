"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Contact, GraduationCap, Loader2, PhoneCall } from "lucide-react";

// Import komponen-komponen modular (Sesuaikan path file dengan folder Anda)
import { UserTopbar } from "./UserTopbar";
import { BookingTab, NebengTab, StatusTab } from "./UserTabs";
import { BookingModal, JoinModal, TitipModal, ReturnModal } from "./UserModals";

export default function UserPortalView() {
  // ==========================================
  // STATE NAVIGASI & UI
  // ==========================================
  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">(
    "booking",
  );
  const [selectedFleet, setSelectedFleet] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States untuk Pop-up Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isTitipOpen, setIsTitipOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [activeTripContext, setActiveTripContext] = useState<any>(null);

  // ==========================================
  // STATE DATA (Dari API Route Next.js)
  // ==========================================
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [nebengList, setNebengList] = useState<any[]>([]);
  const [packageList, setPackageList] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch("/api/portal/vehicles");
        const json = await res.json();
        if (json.success) {
          setVehicles(json.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data kendaraan", error);
        toast.error("Gagal terhubung ke server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ==========================================
  // LOGIKA HANDLER (Kirim Data ke API)
  // ==========================================
  const submitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      vehicleId: selectedFleet,
      date: selectedDate,
      destination: formData.get("destination"),
      timeOut: formData.get("timeOut"),
      timeIn: formData.get("timeIn"),
      passengers: formData.get("passengers"),
    };

    try {
      // Tembak ke API Route Next.js (Yang akan diteruskan ke NestJS)
      const res = await fetch("/api/portal/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        setIsBookingOpen(false);
        setActiveTab("status"); // Pindah ke tab status setelah sukses
      } else {
        toast.error(result.message || "Gagal mengajukan peminjaman.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const submitJoinRide = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setNebengList((prev) => [
      ...prev,
      {
        tripName: activeTripContext?.name,
        dropOff: formData.get("dropOff"),
        seats: formData.get("seats"),
        status: "Menunggu Driver",
      },
    ]);
    setIsJoinOpen(false);
    toast.success("Berhasil! Notifikasi terkirim ke supir.");
  };

  const submitTitipBarang = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPackageList((prev) => [
      ...prev,
      {
        tripName: activeTripContext?.name,
        description: formData.get("itemDesc"),
        receiver: formData.get("receiver"),
        status: "Di Tangan Driver",
      },
    ]);
    setIsTitipOpen(false);
    toast.success("Barang tercatat di log penitipan armada.");
  };

  const confirmReturn = () => {
    setIsReturnOpen(false);
    toast.success(
      "Pengembalian dilaporkan! Menunggu verifikasi fisik oleh GA.",
    );
  };

  // ==========================================
  // RENDER UTAMA
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  // ==========================================
  // RENDER UTAMA
  // ==========================================
  return (
    <div className="bg-[#fcfbf9] text-slate-800 min-h-screen flex flex-col font-sans selection:bg-teal-100">
      {/* HEADER / NAVIGASI */}
      <UserTopbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* KONTEN UTAMA */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* BANNER PROFIL PENGGUNA */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl">
              BS
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-[#1a365d]">
                Budi Santoso, S.Pd.
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Contact className="w-3.5 h-3.5" /> NIY: 198203042005
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Guru Akademik
                </span>
              </div>
            </div>
          </div>
          <a
            href="https://wa.me/628123456789"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" /> Hubungi GA
          </a>
        </div>

        {/* PENYUNTIKAN TAB DINAMIS */}
        {activeTab === "booking" && (
          <BookingTab
            selectedFleet={selectedFleet}
            setSelectedFleet={setSelectedFleet}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onOpenBookingModal={() => setIsBookingOpen(true)}
          />
        )}

        {activeTab === "nebeng" && (
          <NebengTab
            nebengList={nebengList}
            packageList={packageList}
            onOpenJoinModal={(trip: any) => {
              setActiveTripContext(trip);
              setIsJoinOpen(true);
            }}
            onOpenTitipModal={(trip: any) => {
              setActiveTripContext(trip);
              setIsTitipOpen(true);
            }}
          />
        )}

        {activeTab === "status" && (
          <StatusTab onOpenReturnModal={() => setIsReturnOpen(true)} />
        )}
      </main>

      {/* PENYUNTIKAN MODALS DI ROOT */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSubmit={submitBooking}
      />

      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSubmit={submitJoinRide}
        activeTrip={activeTripContext}
      />

      <TitipModal
        isOpen={isTitipOpen}
        onClose={() => setIsTitipOpen(false)}
        onSubmit={submitTitipBarang}
        activeTrip={activeTripContext}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        onConfirm={confirmReturn}
      />
    </div>
  );
}
