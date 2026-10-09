"use client";

import { useState, useEffect } from "react";
import PortalNavbar from "./components/layout/PortalNavbar";
import UserProfile from "./components/layout/UserProfile";
import BookingView from "./components/views/BookingView";
import RideShareView from "./components/views/RideShareView";
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

// ✨ PENCEGAHAN EKSTRA KETAT: Fungsi untuk memaksa nilai menjadi String
// Ini akan memblokir 100% error "Objects are not valid as a React child"
const safeExtractString = (value: any, fallback: string = ""): string => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    // Jika value ternyata object, kita ambil 'name' atau 'id'-nya sebagai string
    return String(value.name || value.id || value.title || fallback);
  }
  return fallback;
};

function PortalContent() {
  const {
    vehicles,
    fetchVehicles,
    availableRides,
    myRideShares,
    fetchAvailableRides,
    fetchMyRideShares,
    submitBooking,
  } = useUserBooking();

  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">(
    "booking",
  );

  // STATE UNTUK UI/UX SMART BOOKING
  const [selectedFleetId, setSelectedFleetId] = useState<string>("");
  const [selectedFleetName, setSelectedFleetName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNowMode, setIsNowMode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [joinModalData, setJoinModalData] = useState({
    isOpen: false,
    bookingId: "",
  });

  useEffect(() => {
    fetchVehicles();
    fetchAvailableRides();
    fetchMyRideShares();
  }, [fetchVehicles, fetchAvailableRides, fetchMyRideShares]);

  // Handler untuk mengamankan tab change jika Navbar mengirim object
  const handleTabChange = (val: any) => {
    const tabString = safeExtractString(val, "booking");
    if (["booking", "nebeng", "status"].includes(tabString)) {
      setActiveTab(tabString as any);
    }
  };

  // Handler Modal Booking dengan filter object super ketat
  const handleOpenBookingModal = (
    id: any,
    name: any,
    isNow: boolean,
    date: any,
  ) => {
    // Mengantisipasi jika komponen View mengirim 1 object utuh pada parameter pertama
    let rawId = id;
    let rawName = name;

    if (typeof id === "object" && id !== null) {
      rawId = id.id || id;
      rawName = id.name || name;
    }

    setSelectedFleetId(safeExtractString(rawId));
    setSelectedFleetName(safeExtractString(rawName, "Kendaraan"));
    setIsNowMode(Boolean(isNow));
    setSelectedDate(date instanceof Date ? date : null);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    const payloadToBackend = {
      vehicleId: selectedFleetId,
      ...formData,
      passengers: parseInt(formData.passengers as string, 10) || 1,
    };
    await submitBooking(payloadToBackend);
  };
  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-sans">
      <PortalNavbar activeTab={activeTab} setActiveTab={handleTabChange} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile />

        {/* --- TAB 1 CONTENT: PEMINJAMAN ARMADA --- */}
        {activeTab === "booking" && (
          <BookingView
            vehicles={vehicles}
            allBookings={availableRides}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenJoinModal={(targetId: string, type: "booking" | "routine") =>
              setJoinModalData({ isOpen: true, bookingId: targetId })
            }
          />
        )}

        {/* --- TAB 2 CONTENT: NEBENG --- */}
        {activeTab === "nebeng" && (
          <RideShareView
            availableRides={availableRides}
            activeNebeng={myRideShares}
            openJoinModal={(data: any) => {
              // Mengamankan ID nebeng dari object
              setJoinModalData({
                isOpen: true,
                bookingId: safeExtractString(data),
              });
            }}
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
        isNowInitially={isNowMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
      />

      <JoinRideModal
        isOpen={joinModalData.isOpen}
        bookingId={joinModalData.bookingId}
        onClose={() => setJoinModalData({ isOpen: false, bookingId: "" })}
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
