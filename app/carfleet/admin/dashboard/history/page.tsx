"use client";

import { useDashboard } from "@/app/carfleet/context/DashboardContext";
import React, { useState, useEffect } from "react";

export default function HistoryPage() {
  const { vehicleReports, isReportLoading, fetchVehicleReports } = useDashboard();
  
  // State Filter
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // State Tab Aktif
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);

  // Jalankan fetch saat bulan/tahun berubah
  useEffect(() => {
    fetchVehicleReports(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, fetchVehicleReports]);

  // Set default tab mobil pertama saat data ter-load
  useEffect(() => {
    if (vehicleReports.length > 0 && !activeVehicleId) {
      setActiveVehicleId(vehicleReports[0].id);
    }
  }, [vehicleReports, activeVehicleId]);

  const activeVehicle = vehicleReports.find((v) => v.id === activeVehicleId);

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan Detail Kendaraan</h1>
          <p className="text-slate-500 mt-1">Sesuai dengan Schema Database Prisma</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-slate-300 py-2 px-4 rounded shadow-sm focus:outline-none"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>Bulan: {i + 1}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-300 py-2 px-4 rounded shadow-sm focus:outline-none"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
              <option key={year} value={year}>Tahun: {year}</option>
            ))}
          </select>
        </div>
      </header>

      {isReportLoading ? (
        <div className="text-center py-10 text-slate-500">Memuat laporan...</div>
      ) : vehicleReports.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Tidak ada data kendaraan.</div>
      ) : (
        <>
          {/* TABS KENDARAAN */}
          <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
            {vehicleReports.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setActiveVehicleId(vehicle.id)}
                className={`px-6 py-3 border-b-2 font-bold whitespace-nowrap ${
                  activeVehicleId === vehicle.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 font-medium"
                }`}
              >
                {vehicle.name} - {vehicle.platNumber}
              </button>
            ))}
          </div>

          {activeVehicle && (
            <>
              {/* KARTU INFO KENDARAAN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-1">Status Kendaraan (status)</p>
                  <h3 className="text-2xl font-bold text-emerald-600">{activeVehicle.status}</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Kapasitas (capacity)</p>
                  <h3 className="text-2xl font-bold text-slate-800">{activeVehicle.capacity} Penumpang</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-1">Tipe Kendaraan (type)</p>
                  <h3 className="text-2xl font-bold text-slate-800">{activeVehicle.type}</h3>
                </div>
              </div>

              {/* TABEL BOOKING */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-800">Tabel Booking (Model: Booking)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">date</th>
                        <th className="p-3">picName</th>
                        <th className="p-3">driverName</th>
                        <th className="p-3">destination</th>
                        <th className="p-3">purpose</th>
                        <th className="p-3">timeOut</th>
                        <th className="p-3">actualTimeIn</th>
                        <th className="p-3">startKm</th>
                        <th className="p-3">endKm</th>
                        <th className="p-3">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeVehicle.bookings.length === 0 ? (
                        <tr><td colSpan={10} className="p-4 text-center">Belum ada booking bulan ini</td></tr>
                      ) : (
                        activeVehicle.bookings.map((booking: any) => (
                          <tr key={booking.id} className="hover:bg-slate-50">
                            <td className="p-3">{new Date(booking.date).toLocaleDateString("id-ID")}</td>
                            <td className="p-3">{booking.picName || "-"}</td>
                            <td className="p-3">{booking.driverName || "-"}</td>
                            <td className="p-3">{booking.destination}</td>
                            <td className="p-3">{booking.purpose || "-"}</td>
                            <td className="p-3">{booking.timeOut}</td>
                            <td className="p-3">{booking.actualTimeIn || "-"}</td>
                            <td className="p-3">{booking.startKm || "-"}</td>
                            <td className="p-3">{booking.endKm || "-"}</td>
                            <td className="p-3">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL MAINTENANCE */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-800">Tabel Maintenance (Model: MaintenanceLog)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">date</th>
                        <th className="p-3">type</th>
                        <th className="p-3">description</th>
                        <th className="p-3">kilometer</th>
                        <th className="p-3">cost</th>
                        <th className="p-3">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeVehicle.maintenances.length === 0 ? (
                        <tr><td colSpan={6} className="p-4 text-center">Belum ada maintenance bulan ini</td></tr>
                      ) : (
                        activeVehicle.maintenances.map((maint: any) => (
                          <tr key={maint.id} className="hover:bg-slate-50">
                            <td className="p-3">{new Date(maint.date).toLocaleDateString("id-ID")}</td>
                            <td className="p-3">{maint.type}</td>
                            <td className="p-3">{maint.description}</td>
                            <td className="p-3">{maint.kilometer}</td>
                            <td className="p-3 text-red-600 font-medium">Rp {maint.cost.toLocaleString("id-ID")}</td>
                            <td className="p-3">{maint.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}