"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users, History } from "lucide-react";
import { formatDate } from "../constants";
import { RecentRequest } from "../types";

interface RecentRequestsListProps {
  requests: RecentRequest[];
  subordinateRequests?: any[]; // Prop baru untuk data riwayat bawahan
}

const getDisplayType = (req: any) => {
  if (req.type === "IZIN" && req.category) {
    const cat = req.category.toLowerCase();

    // Ganti izin umum/pribadi menjadi "Izin" saja
    if (cat.includes("umum") || cat.includes("pribadi")) return "Izin";
    // Rapikan IzinKeluar
    if (cat === "izinkeluar") return "Izin Keluar";

    // Selain itu kembalikan nama aslinya (Sakit, Telat, Pulang Cepat, dll)
    return req.category;
  }
  return req.type; // Jika CUTI, biarkan CUTI
};

export const RecentRequestsList = ({
  requests,
  subordinateRequests = [],
}: RecentRequestsListProps) => {
  // ==========================================
  // STATE PAGINATION UNTUK RIWAYAT BAWAHAN
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Tampilkan 5 data per halaman

  const totalPages = Math.ceil(subordinateRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubordinates = subordinateRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-8">
      {/* ========================================== */}
      {/* SECTION 1: RIWAYAT PENGAJUAN PRIBADI */}
      {/* ========================================== */}
      <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <History className="h-5 w-5 text-gray-400" />
            Riwayat Pengajuan Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-800 rounded-lg">
              Belum ada riwayat.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row justify-between p-4 border border-gray-800 bg-gray-950 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 font-semibold text-white">
                      {getDisplayType(req)}{" "}
                      {req.status === "APPROVED"
                        ? "✅"
                        : req.status === "REJECTED"
                          ? "❌"
                          : req.status === "CANCELLED"
                            ? "🚫"
                            : "⏳"}
                    </div>
                    <p className="text-sm text-gray-400">
                      {formatDate(req.startDate)}
                      {req.startDate !== req.endDate &&
                        ` - ${formatDate(req.endDate)}`}

                      {req.time && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-800 text-amber-400 border border-gray-700">
                          ⏰ {req.time}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================== */}
      {/* SECTION 2: RIWAYAT PENGAJUAN BAWAHAN */}
      {/* ========================================== */}
      {subordinateRequests.length > 0 && (
        <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
              <Users className="h-5 w-5 text-blue-500" />
              Riwayat Pengajuan Bawahan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedSubordinates.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row justify-between p-4 border border-gray-800 bg-gray-950 rounded-lg"
                >
                  <div>
                    <div className="text-white font-bold text-base mb-1">
                      {req.user?.name || "Tanpa Nama"}
                    </div>
                    <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-300">
                      {getDisplayType(req)}{" "}
                      {req.status === "APPROVED"
                        ? "✅"
                        : req.status === "REJECTED"
                          ? "❌"
                          : req.status === "CANCELLED"
                            ? "🚫"
                            : "⏳"}
                    </div>
                    <p className="text-sm text-gray-400">
                      {formatDate(req.startDate)}
                      {req.startDate !== req.endDate &&
                        ` - ${formatDate(req.endDate)}`}

                      {req.time && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-800 text-amber-400 border border-gray-700">
                          ⏰ {req.time}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* KONTROL PAGINATION BAWAHAN */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Halaman <strong className="text-white">{currentPage}</strong>{" "}
                  dari <strong className="text-white">{totalPages}</strong>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
