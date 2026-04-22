"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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
  Moon,
  Sun,
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
  const { setTheme, theme } = useTheme();

  // STATE UNTUK FILTER DIVISI
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("ALL");

  // --- LOGIKA LOGOUT BARU ---
  const handleLogout = async () => {
    try {
      // Memanggil API internal Next.js untuk menghapus cookie JWT
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Arahkan kembali ke login dan refresh state halaman
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal melakukan logout:", error);
    }
  };

  // --- NAVIGASI ---
  const goToAddEmployee = () => router.push("/admin/employees/add");
  const goToAddDivision = () => router.push("/admin/divisions/add");
  // const goToDivisionDetail = (divisionId: string) => router.push(`/admin/divisions/${divisionId}`);

  // --- LOGIKA FILTER ---
  const filteredLeaveHistory =
    selectedDivisionId === "ALL"
      ? leaveHistory
      : leaveHistory.filter(
          (req) => req.user.divisi?.id === selectedDivisionId,
        );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      {/* NAVBAR */}
      <nav className="border-b bg-white dark:bg-zinc-800 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold dark:text-white">Admin Panel</h1>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
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
            <h2 className="text-3xl font-bold tracking-tight dark:text-white">
              Dashboard
            </h2>
            <p className="text-muted-foreground">
              Selamat datang kembali, {user?.name || "Admin"}
            </p>
          </div>
        </div>

        {/* STATISTIK CARD */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pegawai
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Jumlah seluruh pegawai
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Divisi
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDivisions}</div>
              <p className="text-xs text-muted-foreground">
                Jumlah divisi aktif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SECTION TOMBOL AKSI CEPAT */}
        <div className="flex gap-4">
          <Button onClick={goToAddEmployee} className="gap-2">
            <UserPlus className="h-4 w-4" /> Tambah Pegawai
          </Button>
          <Button onClick={goToAddDivision} variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Tambah Divisi
          </Button>
        </div>

        {/* SECTION: HISTORI STATUS PENGAJUAN IZIN */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 pb-4 border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Histori Pengajuan Izin
              </CardTitle>
              <CardDescription>
                Riwayat aktivitas pengajuan izin pegawai.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select
                value={selectedDivisionId}
                onValueChange={(value) => setSelectedDivisionId(value ?? "ALL")}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-zinc-950">
                  <SelectValue placeholder="Semua Divisi" />
                </SelectTrigger>
                <SelectContent>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead>Pegawai</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaveHistory.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        {req.user.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {req.user.divisi?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {req.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
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
                          className={
                            req.status === "APPROVED"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : req.status === "PENDING"
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : ""
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

                  {/* UX: State jika filter kosong */}
                  {filteredLeaveHistory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground h-32"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600" />
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
