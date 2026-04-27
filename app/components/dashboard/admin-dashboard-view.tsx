"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  LogOut,
  Clock,
  Users,
  Building2,
  UserPlus,
  PlusCircle,
  Filter,
} from "lucide-react";

// ------------------------------------------------
// 1. DEFINISI TIPE DATA
// ------------------------------------------------
export type UserData = {
  name: string;
  email?: string;
  [key: string]: unknown;
};

export type Division = {
  id: string;
  name: string;
  _count?: {
    users: number;
  };
  [key: string]: unknown;
};

export type LeaveRequest = {
  id: string;
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "APPROVED" | "REJECTED" | "PENDING" | string;
  user: {
    name: string;
    divisi?: {
      id: string;
      name: string;
    } | null;
  };
  [key: string]: unknown;
};

// 2. TERAPKAN TIPE PADA PROPS
interface AdminViewProps {
  leaveHistory: LeaveRequest[];
  user: UserData;
  totalEmployees: number;
  divisions: Division[];
  totalDivisions: number;
}

export default function AdminDashboardView({
  leaveHistory = [],
  user,
  totalEmployees,
  divisions = [],
  totalDivisions,
}: AdminViewProps) {
  const router = useRouter();

  // STATE UNTUK FILTER DIVISI
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("ALL");

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal melakukan logout:", error);
    }
  };

  // --- NAVIGASI ---
  const goToAddEmployee = () => router.push("/admin/dashboard/pegawai");

  // --- LOGIKA FILTER ---
  const filteredLeaveHistory =
    selectedDivisionId === "ALL"
      ? leaveHistory
      : leaveHistory.filter(
          (req) => req.user.divisi?.id === selectedDivisionId,
        );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>

        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* HEADER WELCOME */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Dashboard
            </h2>
            <p className="text-gray-400">
              Selamat datang kembali, {user?.name || "Admin"}
            </p>
          </div>
        </div>

        {/* STATISTIK CARD */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card className="border-gray-800 bg-gray-900 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Pegawai
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalEmployees}
              </div>
              <p className="text-xs text-gray-400">Jumlah seluruh pegawai</p>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Divisi
              </CardTitle>
              <Building2 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalDivisions}
              </div>
              <p className="text-xs text-gray-400">Jumlah divisi aktif</p>
            </CardContent>
          </Card>
        </div>

        {/* SECTION TOMBOL AKSI CEPAT */}
        <div className="flex gap-4">
          <Button
            onClick={goToAddEmployee}
            className="gap-2 bg-green-700 hover:bg-crimson-800 text-white"
          >
            <UserPlus className="h-4 w-4" /> Tambah Pegawai
          </Button>
          {/* <Button
            onClick={goToAddDivision}
            variant="outline"
            className="gap-2 border-crimson-700 bg-crimson-900 text-crimson-300 hover:bg-crimson-950 hover:text-crimson-200"
          >
            <PlusCircle className="h-4 w-4" /> Tambah Divisi
          </Button> */}
        </div>

        {/* SECTION: HISTORI STATUS PENGAJUAN IZIN */}
        <Card className="shadow-md border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-800/50 pb-4 border-b border-gray-800">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-crimson-500" />
                Histori Pengajuan Izin
              </CardTitle>
              <CardDescription className="text-gray-400">
                Riwayat aktivitas pengajuan izin pegawai.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
              <Select
                value={selectedDivisionId}
                onValueChange={(value) => setSelectedDivisionId(value ?? "ALL")}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Semua Divisi" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="ALL">Semua Divisi</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="rounded-md border border-gray-800">
              <Table>
                <TableHeader className="bg-gray-800/50">
                  <TableRow>
                    <TableHead className="text-gray-300">Pegawai</TableHead>
                    <TableHead className="text-gray-300">Divisi</TableHead>
                    <TableHead className="text-gray-300">Tipe</TableHead>
                    <TableHead className="text-gray-300">Tanggal</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaveHistory.map((req) => (
                    <TableRow key={req.id} className="border-b border-gray-800">
                      <TableCell className="font-medium text-white">
                        {req.user.name}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {req.user.divisi?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-gray-700 text-gray-300 font-normal"
                        >
                          {req.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {new Date(req.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                        {" - "}
                        {new Date(req.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === "APPROVED"
                              ? "default"
                              : req.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                          className={`
                            ${req.status === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                            ${req.status === "PENDING" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                            ${req.status === "REJECTED" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                          `}
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

                  {filteredLeaveHistory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500 h-32"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Clock className="h-8 w-8 text-gray-700" />
                          <p>
                            Belum ada data pengajuan{" "}
                            {selectedDivisionId !== "ALL" && "pada divisi ini"}.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
