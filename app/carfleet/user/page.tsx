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
    vehicles, // ✨ Ambil data mobil dari backend melalui Context
    fetchVehicles, // ✨ Ambil fungsi fetch data mobil
    availableRides,
    myRideShares,
    myPackages,
    fetchAvailableRides,
    fetchMyRideShares,
    fetchMyPackages,
    submitBooking, // ✨ Ambil fungsi submit booking dari Context
  } = useUserBooking();

  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">(
    "booking",
  );

  const [selectedFleet, setSelectedFleet] = useState<string | number>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STATE UNTUK TAB 2: NEBENG & TITIP MODAL ---
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

  // ✨ FETCH SEMUA DATA SAAT HALAMAN PERTAMA KALI DIMUAT
  useEffect(() => {
    fetchVehicles(); // ✨ Ambil data mobil dari backend
    fetchAvailableRides();
    fetchMyRideShares();
    fetchMyPackages();
  }, [fetchVehicles, fetchAvailableRides, fetchMyRideShares, fetchMyPackages]);

  // ✨ MENCARI NAMA MOBIL SECARA DINAMIS DARI DATA BACKEND
  const selectedVehicleObj = vehicles.find((v) => v.id === selectedFleet);
  const fleetName = selectedVehicleObj
    ? selectedVehicleObj.name
    : "Armada Belum Dipilih";

  // --- HANDLER SUBMIT KE BACKEND ---
  const handleBookingSubmit = async (formData: any) => {
    const payloadToBackend = {
      vehicleId: selectedFleet, // Mengirimkan ID asli mobil ke backend
      ...formData,
    };

    // ✨ Mengirim data asli lewat Context ke API NestJS
    const isSuccess = await submitBooking(payloadToBackend);

    if (isSuccess) {
      alert("Sukses! Permohonan peminjaman berhasil dikirim ke Admin GA.");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-sans">
      <PortalNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile />

        {/* --- TAB 1 CONTENT: PEMINJAMAN ARMADA --- */}
        {activeTab === "booking" && (
          <BookingView
            vehicles={vehicles} // ✨ Lempar data mobil dari backend ke komponen view Anda
            selectedFleet={selectedFleet}
            setSelectedFleet={setSelectedFleet}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openModal={() => {
              if (!selectedFleet) {
                alert("Silakan pilih armada mobil terlebih dahulu!");
                return;
              }
              setIsModalOpen(true);
            }}
          />
        )}

        {/* --- TAB 2 CONTENT: NEBENG & TITIP BARANG --- */}
        {activeTab === "nebeng" && (
          <RideShareView
            availableRides={availableRides}
            activeNebeng={myRideShares}
            activePackages={myPackages}
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
          isOpen={isModalOpen}
          selectedFleetName={fleetName}
          selectedDate={selectedDate}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Modal Nebeng */}
      {joinModalData.isOpen && (
        <JoinRideModal
          isOpen={joinModalData.isOpen}
          bookingId={joinModalData.bookingId}
          onClose={() => setJoinModalData({ isOpen: false, bookingId: "" })}
        />
      )}

      {/* Modal Titip Paket */}
      {packageModalData.isOpen && (
        <PackageModal
          isOpen={packageModalData.isOpen}
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
