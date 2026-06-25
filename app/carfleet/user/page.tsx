"use client";

import { useState, useEffect } from "react";
import PortalNavbar from "./components/layout/PortalNavbar";
import UserProfile from "./components/layout/UserProfile";
import BookingView from "./components/views/BookingView";
import RideShareView from "./components/views/RideShareView";
import PackageModal from "./components/modals/PackageModal";
import BookingModal from "./components/modals/BookingModal";
import StatusView from "./components/views/StatusView";
import {
  UserBookingProvider,
  useUserBooking,
} from "../context/UserBookingContext";
import JoinRideModal from "./components/modals/JoinRideModal";

// ======================================================================
// 1. KOMPONEN ISI HALAMAN (Mengkonsumsi Context)
// ======================================================================
function PortalContent() {
  const {
    availableRides,
    myRideShares,
    myPackages,
    fetchAvailableRides,
    fetchMyRideShares,
    fetchMyPackages,
  } = useUserBooking();

  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">(
    "booking",
  );

  // --- STATE UNTUK TAB 1: PEMINJAMAN ---
  const [selectedFleet, setSelectedFleet] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STATE UNTUK TAB 2: NEBENG & TITIP MODAL ---
  // ✨ Kita cukup simpan bookingId karena modal akan menembak ke API menggunakan ID tersebut
  const [joinModalData, setJoinModalData] = useState<{
    isOpen: boolean;
    bookingId: string;
  }>({
    isOpen: false,
    bookingId: "",
  });
  const [packageModalData, setPackageModalData] = useState<{
    isOpen: boolean;
    bookingId: string;
  }>({
    isOpen: false,
    bookingId: "",
  });

  // ✨ FETCH DATA SAAT HALAMAN DIMUAT
  useEffect(() => {
    fetchAvailableRides();
    fetchMyRideShares();
    fetchMyPackages();
  }, []);

  // --- HANDLER FUNGSI PEMINJAMAN UTAMA (Belum tersambung ke Context/API) ---
  const getFleetName = (id: number) => {
    if (id === 1) return "Toyota Hiace Commuter";
    if (id === 2) return "Kijang Innova Reborn";
    return "Armada Belum Dipilih";
  };
  const fleetName = getFleetName(selectedFleet);

  const handleBookingSubmit = (formData: any) => {
    const payloadToBackend = {
      fleetId: selectedFleet,
      fleetName: fleetName,
      date: selectedDate,
      ...formData,
    };

    console.log("Data siap kirim ke API NestJS:", payloadToBackend);
    alert("Sukses! Permohonan peminjaman berhasil dikirim ke Admin GA.");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-sans">
      <PortalNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile />

        {/* --- TAB 1 CONTENT: PEMINJAMAN ARMADA --- */}
        {activeTab === "booking" && (
          <BookingView
            selectedFleet={selectedFleet}
            setSelectedFleet={setSelectedFleet}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openModal={() => setIsModalOpen(true)}
          />
        )}

        {/* --- TAB 2 CONTENT: NEBENG & TITIP BARANG --- */}
        {activeTab === "nebeng" && (
          <RideShareView
            // ✨ Berikan data asli dari database ke tampilan view
            availableRides={availableRides}
            activeNebeng={myRideShares}
            activePackages={myPackages}
            // ✨ Sesuaikan handler dengan tambahan ID
            openJoinModal={(id) =>
              setJoinModalData({ isOpen: true, bookingId: id })
            }
            openPackageModal={(id) =>
              setPackageModalData({ isOpen: true, bookingId: id })
            }
          />
        )}

        {/* --- TAB 3 CONTENT: STATUS SAYA --- */}
        {activeTab === "status" && <StatusView />}
      </main>

      {/* ================= MODALS ================= */}

      {/* Modal Peminjaman / Booking Utama */}
      {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen} // ✨ Tambahkan ini
          selectedFleetName={fleetName}
          selectedDate={selectedDate}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Modal Nebeng */}
      {joinModalData.isOpen && (
        <JoinRideModal
          isOpen={joinModalData.isOpen} // ✨ Tambahkan ini untuk menyelesaikan error
          bookingId={joinModalData.bookingId}
          onClose={() => setJoinModalData({ isOpen: false, bookingId: "" })}
        />
      )}

      {/* Modal Titip Paket */}
      {packageModalData.isOpen && (
        <PackageModal
          isOpen={packageModalData.isOpen} // ✨ Tambahkan ini untuk mencegah error selanjutnya
          bookingId={packageModalData.bookingId}
          onClose={() => setPackageModalData({ isOpen: false, bookingId: "" })}
        />
      )}
    </div>
  );
}

// ======================================================================
// 2. KOMPONEN PEMBUNGKUS (Memberikan Context ke Halaman)
// ======================================================================
export default function PortalPage() {
  return (
    <UserBookingProvider>
      <PortalContent />
    </UserBookingProvider>
  );
}
