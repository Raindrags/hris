"use client";

import { useState } from "react";
import PortalNavbar from "./components/layout/PortalNavbar";
import UserProfile from "./components/layout/UserProfile";
import BookingView from "./components/views/BookingView";
import RideShareView from "./components/views/RideShareView";
import JoinRideModal from "./components/modals/JoinRideModal";
import PackageModal from "./components/modals/PackageModal";
import BookingModal from "./components/modals/BookingModal";
import StatusView from "./components/views/StatusView";
import { UserBookingProvider } from "../context/UserBookingContext";

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<"booking" | "nebeng" | "status">(
    "booking",
  );

  // --- STATE UNTUK TAB 1: PEMINJAMAN ---
  const [selectedFleet, setSelectedFleet] = useState(1);
  // PERBAIKAN: Ubah menjadi string kosong karena BookingView mengembalikan string tanggal "YYYY-MM-DD"
  const [selectedDate, setSelectedDate] = useState<string>("");

  // PERBAIKAN: Tambahkan state untuk mengontrol Modal Form Peminjaman
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STATE UNTUK TAB 2: NEBENG & TITIP ---
  const [activeNebeng, setActiveNebeng] = useState<
    { target: string; dropoff: string }[]
  >([]);
  const [activePackages, setActivePackages] = useState<
    { desc: string; receiver: string; vehicle: string }[]
  >([]);

  const [joinModalData, setJoinModalData] = useState<{
    isOpen: boolean;
    target: string;
    vehicle: string;
  }>({ isOpen: false, target: "", vehicle: "" });
  const [packageModalData, setPackageModalData] = useState<{
    isOpen: boolean;
    target: string;
    vehicle: string;
  }>({ isOpen: false, target: "", vehicle: "" });

  // --- HANDLER FUNGSI ---
  const handleJoinSubmit = (dropoff: string) => {
    setActiveNebeng([
      ...activeNebeng,
      { target: joinModalData.target, dropoff },
    ]);
    setJoinModalData({ ...joinModalData, isOpen: false });
    alert("Permintaan ikut tumpangan berhasil diajukan!"); // Bisa diganti Toast custom
  };

  const handlePackageSubmit = (desc: string, receiver: string) => {
    setActivePackages([
      ...activePackages,
      { desc, receiver, vehicle: packageModalData.vehicle },
    ]);
    setPackageModalData({ ...packageModalData, isOpen: false });
    alert("Manifest titipan barang berhasil didaftarkan!");
  };

  // PERBAIKAN: Fungsi untuk menentukan Nama Armada
  const getFleetName = (id: number) => {
    if (id === 1) return "Toyota Hiace Commuter";
    if (id === 2) return "Kijang Innova Reborn";
    return "Armada Belum Dipilih";
  };
  const fleetName = getFleetName(selectedFleet);

  // PERBAIKAN: Fungsi untuk menerima data dari BookingModal (Form Peminjaman)
  const handleBookingSubmit = (formData: any) => {
    const payloadToBackend = {
      fleetId: selectedFleet,
      fleetName: fleetName,
      date: selectedDate,
      ...formData,
    };

    console.log("Data siap kirim ke API NestJS:", payloadToBackend);
    alert("Sukses! Permohonan peminjaman berhasil dikirim ke Admin GA.");
    setIsModalOpen(false); // Tutup modal setelah dikirim
  };

  return (
    <UserBookingProvider>
      <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-sans">
        <PortalNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <UserProfile />

          {/* --- TAB 1 CONTENT --- */}
          {activeTab === "booking" && (
            <BookingView
              selectedFleet={selectedFleet}
              setSelectedFleet={setSelectedFleet}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              openModal={() => setIsModalOpen(true)} // PERBAIKAN: Buka modal di sini
            />
          )}

          {/* --- TAB 2 CONTENT --- */}
          {activeTab === "nebeng" && (
            <RideShareView
              activeNebeng={activeNebeng}
              activePackages={activePackages}
              openJoinModal={(target, vehicle) =>
                setJoinModalData({ isOpen: true, target, vehicle })
              }
              openPackageModal={(target, vehicle) =>
                setPackageModalData({ isOpen: true, target, vehicle })
              }
            />
          )}
          {/* --- TAB 3 CONTENT: STATUS SAYA --- */}
          {activeTab === "status" && <StatusView />}
        </main>

        {/* Render Modals Berdasarkan State */}

        {/* Modal Peminjaman / Booking */}
        {isModalOpen && (
          <BookingModal
            selectedFleetName={fleetName}
            selectedDate={selectedDate}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleBookingSubmit}
          />
        )}

        {/* Modal Nebeng */}
        {joinModalData.isOpen && (
          <JoinRideModal
            target={joinModalData.target}
            vehicle={joinModalData.vehicle}
            onClose={() =>
              setJoinModalData({ ...joinModalData, isOpen: false })
            }
            onSubmit={handleJoinSubmit}
          />
        )}

        {/* Modal Titip Paket */}
        {packageModalData.isOpen && (
          <PackageModal
            target={packageModalData.target}
            vehicle={packageModalData.vehicle}
            onClose={() =>
              setPackageModalData({ ...packageModalData, isOpen: false })
            }
            onSubmit={handlePackageSubmit}
          />
        )}
      </div>
    </UserBookingProvider>
  );
}
