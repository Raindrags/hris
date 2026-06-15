import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Filter } from "lucide-react";

// (Pastikan Anda mengimpor type Division & LeaveRequest dari file utamanya)
export function LeaveHistoryTable({ leaveHistory, divisions }: any) {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("ALL");

  const filteredHistory =
    selectedDivisionId === "ALL"
      ? leaveHistory
      : leaveHistory.filter(
          (req: any) => req.user.divisi?.id === selectedDivisionId,
        );

  return (
    <Card className="border-gray-800 bg-gray-900 shadow-md col-span-full">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-crimson-500" /> Histori Pengajuan
            </CardTitle>
            <CardDescription className="text-gray-400">
              Riwayat aktivitas pengajuan izin pegawai.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
            <Select
              value={selectedDivisionId}
              onValueChange={(v) => setSelectedDivisionId(v ?? "ALL")}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-gray-800 border-gray-700 text-gray-200">
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectItem value="ALL">Semua Divisi</SelectItem>
                {divisions.map((div: any) => (
                  <SelectItem key={div.id} value={div.id}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-800/50">
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-300">Pegawai</TableHead>
              <TableHead className="text-gray-300">Divisi</TableHead>
              <TableHead className="text-gray-300">Tanggal</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((req: any) => (
              <TableRow key={req.id} className="border-b border-gray-800">
                <TableCell className="font-medium text-white">
                  {req.user.name}
                </TableCell>
                <TableCell className="text-gray-400">
                  {req.user.divisi?.name || "-"}
                </TableCell>
                <TableCell className="text-gray-300">
                  {new Date(req.startDate).toLocaleDateString("id-ID")} -{" "}
                  {new Date(req.endDate).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      req.status === "APPROVED"
                        ? "bg-emerald-950 text-emerald-400"
                        : req.status === "REJECTED"
                          ? "bg-red-950 text-red-400"
                          : "bg-yellow-950 text-yellow-400"
                    }
                  >
                    {req.status === "APPROVED"
                      ? "Disetujui"
                      : req.status === "REJECTED"
                        ? "Ditolak"
                        : "Pending"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
