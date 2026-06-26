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

// ✨ 1. Buat tipe data khusus untuk form agar tidak pakai 'any'
interface BookingFormData {
  picName: string;
  contactNumber: string;
  driverName: string;
  purpose: string;
  destination: string;
  date: string;
  timeOut: string;
  timeIn: string;
  passengers: number | string;
}

// ======================================================================
// 1. KOMPONEN ISI HALAMAN (Mengkonsumsi Context)
// ======================================================================
function PortalContent() {
  const {
    vehicles,
    fetchVehicles,
    availableRides,
    myRideShares,
    myPackages,
    fetchAvailableRides,
    fetchMyRideShares,
    fetchMyPackages,
    submitBooking,
  } = useUserBooking();

  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">(
    "booking",
  );

  const [selectedFleet, setSelectedFleet] = useState<string | number>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STATE UNTUK TAB 2: NEBENG & TITIP MODAL ---
  const [joinModalData, setJoinModalData] = useState({
    isOpen: false,
    bookingId: "",
  });
  const [packageModalData, setPackageModalData] = useState({
    isOpen: false,
    bookingId: "",
  });

  // ✨ FETCH SEMUA DATA SAAT HALAMAN PERTAMA KALI DIMUAT
  useEffect(() => {
    fetchVehicles();
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
  const handleBookingSubmit = async (formData: BookingFormData) => {
    const payloadToBackend = {
      vehicleId: selectedFleet,
      ...formData,
      passengers: parseInt(formData.passengers as string, 10) || 1,
    };

    console.log("MENGIRIM DATA KE BACKEND:", payloadToBackend);

    // ✨ 2. Hapus backticks (``;) yang error di kode sebelumnya
    const isSuccess = await submitBooking(payloadToBackend);

    if (isSuccess) {
      alert("Sukses! Permohonan peminjaman berhasil dikirim ke Admin GA.");
      setIsModalOpen(false);
    }
  };

  // ✨ 3. Pindahkan logic open modal ke atas agar rapi
  const handleOpenBookingModal = () => {
    if (!selectedFleet) {
      alert("Silakan pilih armada mobil terlebih dahulu!");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-sans">
      <PortalNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile />

        {/* --- TAB 1 CONTENT: PEMINJAMAN ARMADA --- */}
        {activeTab === "booking" && (
          <BookingView
            vehicles={vehicles}
            selectedFleet={selectedFleet}
            // ✨ 4. Lebih rapi, panggil state setter secara langsung
            setSelectedFleet={setSelectedFleet}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openModal={handleOpenBookingModal}
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
      <BookingModal
        isOpen={isModalOpen}
        selectedFleetName={fleetName}
        selectedDate={selectedDate}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
      />

      {/* Modal Nebeng */}
      <JoinRideModal
        isOpen={joinModalData.isOpen}
        bookingId={joinModalData.bookingId}
        onClose={() => setJoinModalData({ isOpen: false, bookingId: "" })}
      />

      {/* Modal Titip Paket */}
      <PackageModal
        isOpen={packageModalData.isOpen}
        bookingId={packageModalData.bookingId}
        onClose={() => setPackageModalData({ isOpen: false, bookingId: "" })}
      />
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
