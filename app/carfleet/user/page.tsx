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

  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">("booking");

  // ✨ STATE BARU UNTUK UI/UX SMART BOOKING
  const [selectedFleetId, setSelectedFleetId] = useState<string | number>("");
  const [selectedFleetName, setSelectedFleetName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNowMode, setIsNowMode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [joinModalData, setJoinModalData] = useState({ isOpen: false, bookingId: "" });
  const [packageModalData, setPackageModalData] = useState({ isOpen: false, bookingId: "" });

  useEffect(() => {
    fetchVehicles();
    fetchAvailableRides();
    fetchMyRideShares();
    fetchMyPackages();
  }, [fetchVehicles, fetchAvailableRides, fetchMyRideShares, fetchMyPackages]);

  // ✨ HANDLER BARU: Langsung set semua state dari BookingView
  const handleOpenBookingModal = (id: string, name: string, isNow: boolean, date: Date) => {
    setSelectedFleetId(id);
    setSelectedFleetName(name);
    setIsNowMode(isNow);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    const payloadToBackend = {
      vehicleId: selectedFleetId,
      ...formData,
      passengers: parseInt(formData.passengers as string, 10) || 1,
    };

    console.log("MENGIRIM DATA KE BACKEND:", payloadToBackend);

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
            vehicles={vehicles}
            allBookings={availableRides} // Passing data jadwal berjalan untuk cek bentrok
            onOpenBookingModal={handleOpenBookingModal}
          />
        )}

        {/* --- TAB 2 CONTENT: NEBENG & TITIP BARANG --- */}
        {activeTab === "nebeng" && (
          <RideShareView
            availableRides={availableRides}
            activeNebeng={myRideShares}
            activePackages={myPackages}
            openJoinModal={(id) => setJoinModalData({ isOpen: true, bookingId: id })}
            openPackageModal={(id) => setPackageModalData({ isOpen: true, bookingId: id })}
          />
        )}

        {/* --- TAB 3 CONTENT: STATUS SAYA --- */}
        {activeTab === "status" && <StatusView />}
      </main>

      {/* ================= MODALS ================= */}
      <BookingModal
        isOpen={isModalOpen}
        selectedFleetName={selectedFleetName}
        selectedDate={selectedDate}
        isNowInitially={isNowMode} // Prop baru untuk mode cepat
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
      />

      <JoinRideModal
        isOpen={joinModalData.isOpen}
        bookingId={joinModalData.bookingId}
        onClose={() => setJoinModalData({ isOpen: false, bookingId: "" })}
      />

      <PackageModal
        isOpen={packageModalData.isOpen}
        bookingId={packageModalData.bookingId}
        onClose={() => setPackageModalData({ isOpen: false, bookingId: "" })}
      />
    </div>
  );
}

export default function PortalPage() {
  return (
    <UserBookingProvider>
      <PortalContent />
    </UserBookingProvider>
  );
}