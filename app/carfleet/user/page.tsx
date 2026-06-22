'use client';

import { useState } from 'react';
import PortalNavbar from './components/layout/PortalNavbar';
import UserProfile from './components/layout/UserProfile';
import BookingView from './components/views/BookingView';
import RideShareView from './components/views/RideShareView';
import JoinRideModal from './components/modals/JoinRideModal';
import PackageModal from './components/modals/PackageModal';

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<'booking' | 'nebeng' | 'status'>('booking');

  // --- STATE UNTUK TAB 1: PEMINJAMAN ---
  const [selectedFleet, setSelectedFleet] = useState(1);
  const [selectedDate, setSelectedDate] = useState(1);

  // --- STATE UNTUK TAB 2: NEBENG & TITIP ---
  const [activeNebeng, setActiveNebeng] = useState<{target: string, dropoff: string}[]>([]);
  const [activePackages, setActivePackages] = useState<{desc: string, receiver: string, vehicle: string}[]>([]);
  
  const [joinModalData, setJoinModalData] = useState<{isOpen: boolean, target: string, vehicle: string}>({ isOpen: false, target: '', vehicle: '' });
  const [packageModalData, setPackageModalData] = useState<{isOpen: boolean, target: string, vehicle: string}>({ isOpen: false, target: '', vehicle: '' });

  // --- HANDLER FUNGSI ---
  const handleJoinSubmit = (dropoff: string) => {
    setActiveNebeng([...activeNebeng, { target: joinModalData.target, dropoff }]);
    setJoinModalData({ ...joinModalData, isOpen: false });
    alert('Permintaan ikut tumpangan berhasil diajukan!'); // Bisa diganti Toast custom
  };

  const handlePackageSubmit = (desc: string, receiver: string) => {
    setActivePackages([...activePackages, { desc, receiver, vehicle: packageModalData.vehicle }]);
    setPackageModalData({ ...packageModalData, isOpen: false });
    alert('Manifest titipan barang berhasil didaftarkan!'); 
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800 font-sans">
      <PortalNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile />

        {activeTab === 'booking' && (
          <BookingView 
            selectedFleet={selectedFleet}
            setSelectedFleet={setSelectedFleet}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openModal={() => alert('Modal Booking belum diimplementasi')}
          />
        )}

        {activeTab === 'nebeng' && (
          <RideShareView 
            activeNebeng={activeNebeng}
            activePackages={activePackages}
            openJoinModal={(target, vehicle) => setJoinModalData({ isOpen: true, target, vehicle })}
            openPackageModal={(target, vehicle) => setPackageModalData({ isOpen: true, target, vehicle })}
          />
        )}
      </main>

      {/* Render Modals Berdasarkan State */}
      {joinModalData.isOpen && (
        <JoinRideModal 
          target={joinModalData.target} 
          vehicle={joinModalData.vehicle} 
          onClose={() => setJoinModalData({ ...joinModalData, isOpen: false })} 
          onSubmit={handleJoinSubmit} 
        />
      )}

      {packageModalData.isOpen && (
        <PackageModal
          target={packageModalData.target} 
          vehicle={packageModalData.vehicle} 
          onClose={() => setPackageModalData({ ...packageModalData, isOpen: false })} 
          onSubmit={handlePackageSubmit} 
        />
      )}

    </div>
  );
}