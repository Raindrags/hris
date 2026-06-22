import React, { useEffect } from "react";
import {
  Bus,
  Car,
  Package,
  MapPin,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { useUserBooking } from "@/app/carfleet/context/UserBookingContext";

export default function StatusView() {
  const {
    myBookings,
    fetchMyBookings,
    myRideShares,
    fetchMyRideShares,
    myPackages,
    fetchMyPackages,
    isLoading,
  } = useUserBooking();

  useEffect(() => {
    fetchMyBookings();
    fetchMyRideShares();
    fetchMyPackages();
  }, [fetchMyBookings, fetchMyRideShares, fetchMyPackages]);

  // Helper untuk Warna Status
  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return {
          bg: "bg-amber-50",
          text: "text-amber-600",
          border: "border-amber-200",
          icon: <Clock3 className="w-4 h-4 mr-1" />,
        };
      case "APPROVED":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          border: "border-emerald-200",
          icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
        };
      case "REJECTED":
        return {
          bg: "bg-rose-50",
          text: "text-rose-600",
          border: "border-rose-200",
          icon: <XCircle className="w-4 h-4 mr-1" />,
        };
      case "COMPLETED":
        return {
          bg: "bg-slate-100",
          text: "text-slate-600",
          border: "border-slate-200",
          icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-500",
          border: "border-slate-200",
          icon: <Info className="w-4 h-4 mr-1" />,
        };
    }
  };

  // Helper untuk Empty State
  const EmptyState = ({
    message,
    icon: Icon,
  }: {
    message: string;
    icon: any;
  }) => (
    <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
      <Icon className="w-12 h-12 text-slate-300 mb-3" />
      <p className="text-slate-500 font-medium text-sm">{message}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300 pb-20">
      {/* SECTION 1: PEMINJAMAN ARMADA */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Bus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d]">
            Pengajuan Sewa Armada
          </h2>
        </div>

        {myBookings.length === 0 ? (
          <EmptyState
            message="Belum ada riwayat pengajuan peminjaman armada."
            icon={Bus}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBookings.map((b: any) => {
              const st = getStatusStyle(b.status);
              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-[#1a365d] text-lg">
                        {b.destination}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Keperluan: {b.purpose}
                      </p>
                    </div>
                    <span
                      className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}
                    >
                      {st.icon} {b.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {new Date(b.date).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      {b.timeOut} - {b.timeIn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: NEBENG (RIDE SHARE) */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d]">Riwayat Nebeng</h2>
        </div>

        {myRideShares.length === 0 ? (
          <EmptyState
            message="Belum ada riwayat nebeng perjalanan."
            icon={Car}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRideShares.map((r: any) => {
              const st = getStatusStyle(r.status);
              return (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Titik Turun</p>
                        <h3 className="font-bold text-slate-800">
                          {r.dropOff}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p>
                      Menebeng ke tujuan:{" "}
                      <strong>{r.booking?.destination || "Memuat..."}</strong>
                    </p>
                    <p className="text-xs mt-1">Dipesan: {r.seats} Kursi</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: TITIP BARANG */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d]">
            Riwayat Titip Barang
          </h2>
        </div>

        {myPackages.length === 0 ? (
          <EmptyState
            message="Belum ada riwayat penitipan barang/dokumen."
            icon={Package}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPackages.map((p: any) => {
              const st = getStatusStyle(p.status);
              return (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Barang/Dokumen</p>
                      <h3 className="font-bold text-slate-800">
                        {p.description}
                      </h3>
                    </div>
                    <span
                      className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <p>
                      Penerima: <strong>{p.receiver}</strong>
                    </p>
                    <p className="text-xs mt-1">
                      Via perjalanan ke: {p.booking?.destination || "..."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
