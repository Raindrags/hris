import React, { useEffect, useState } from "react";
import { Car, Package, MapPin, Clock, Calendar, Users } from "lucide-react";
import { useUserBooking } from "@/app/carfleet/context/UserBookingContext";
import JoinRideModal from "../modals/JoinRideModal";
import PackageModal from "../modals/PackageModal";

export default function AvailableRidesView() {
  const { availableRides, fetchAvailableRides } = useUserBooking();

  // State untuk mengontrol Modal mana yang terbuka dan ID perjalanan apa yang dipilih
  const [activeJoinModal, setActiveJoinModal] = useState<string | null>(null);
  const [activePackageModal, setActivePackageModal] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchAvailableRides(); // Tarik jadwal saat tab dibuka
  }, [fetchAvailableRides]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-[#1a365d] mb-6">
        Jadwal Keberangkatan Terdekat
      </h2>

      {availableRides.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-3xl text-slate-500">
          Belum ada jadwal keberangkatan armada dalam waktu dekat.
        </div>
      ) : (
        availableRides.map((ride) => (
          <div
            key={ride.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
          >
            {/* Info Perjalanan */}
            <div className="w-full md:w-2/3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  Berangkat
                </span>
                <h3 className="font-bold text-lg">{ride.destination}</h3>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" />{" "}
                  {new Date(ride.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-slate-400" />{" "}
                  {ride.timeOut}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-slate-400" /> Sisa Kursi:{" "}
                  {ride.vehicle?.capacity - ride.passengers}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Kendaraan: {ride.vehicle?.name || "Mobil Dinas"} | Driver:{" "}
                {ride.driverName}
              </p>
            </div>

            {/* Aksi (Trigger Modal) */}
            <div className="w-full md:w-1/3 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveJoinModal(ride.id)}
                className="flex-1 bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-100 flex justify-center items-center gap-2 transition"
              >
                <Car className="w-4 h-4" /> Nebeng
              </button>
              <button
                onClick={() => setActivePackageModal(ride.id)}
                className="flex-1 bg-amber-50 text-amber-600 font-bold py-3 rounded-xl hover:bg-amber-100 flex justify-center items-center gap-2 transition"
              >
                <Package className="w-4 h-4" /> Titip
              </button>
            </div>

            {/* Render Modal jika state aktif cocok dengan ID perjalanan ini */}
            <JoinRideModal
              isOpen={activeJoinModal === ride.id}
              onClose={() => setActiveJoinModal(null)}
              bookingId={ride.id}
            />
            <PackageModal
              isOpen={activePackageModal === ride.id}
              onClose={() => setActivePackageModal(null)}
              bookingId={ride.id}
            />
          </div>
        ))
      )}
    </div>
  );
}
