import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "../constants";
import { RecentRequest } from "../types";

interface RecentRequestsListProps {
  requests: RecentRequest[];
}

// ✨ Fungsi pembantu untuk merapikan nama kategori Izin
const getDisplayType = (req: RecentRequest) => {
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

export const RecentRequestsList = ({ requests }: RecentRequestsListProps) => {
  return (
    <Card className="border-gray-800 bg-gray-900 shadow-md text-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
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
                    {/* ✨ Panggil fungsinya di sini */}
                    {getDisplayType(req)}{" "}
                    {req.status === "APPROVED"
                      ? "✅"
                      : req.status === "REJECTED"
                        ? "❌"
                        : "⏳"}
                  </div>
                  <p className="text-sm text-gray-400">
                    {formatDate(req.startDate)} - {formatDate(req.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
