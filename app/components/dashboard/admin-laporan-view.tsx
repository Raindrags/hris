"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, CalendarX } from "lucide-react";
// ... (Import Table, Button, Badge, Eye, dll seperti sebelumnya)

// Tipe untuk data rekapitulasi numerik dari backend
export type AdminReportSummary = {
  totalKehadiran?: number;
  totalTerlambat?: number;
  totalCuti?: number;
  totalIzin?: number;
  // Jika backend juga mengirimkan array mentah, definisikan di sini:
  rawRequests?: any[];
  [key: string]: any;
};

interface AdminLaporanViewProps {
  initialData: AdminReportSummary | null;
}

export default function AdminLaporanView({
  initialData,
}: AdminLaporanViewProps) {
  // Karena data sudah difetch di server, kita tidak butuh state isLoading atau useEffect fetch lagi!
  const data = initialData || {};

  // (Jika Backend MENGIRIMKAN array data pengajuan di dalam properti `rawRequests`)
  const dbData = Array.isArray(data.rawRequests) ? data.rawRequests : [];

  const [viewState, setViewState] = useState({
    active: "LIST",
    selectedSummary: null as any,
    selectedUser: null as any,
    selectedReq: null as any,
  });

  // Jika gagal memuat data dari server
  if (!initialData) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center text-destructive">
          Gagal memuat data laporan dari server atau Anda tidak memiliki akses.
        </CardContent>
      </Card>
    );
  }

  // --- RENDER SECTION: KARTU REKAPITULASI ---
  const renderOverviewCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kehadiran</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalKehadiran || 0}</div>
          <p className="text-xs text-muted-foreground">Bulan ini</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Terlambat</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalTerlambat || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cuti/Izin</CardTitle>
          <CalendarX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(data.totalCuti || 0) + (data.totalIzin || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan Angka Langsung Tampil di Atas */}
      {renderOverviewCards()}

      <Tabs defaultValue="ringkasan" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ringkasan">Daftar Divisi</TabsTrigger>
          <TabsTrigger value="cuti">Daftar Cuti</TabsTrigger>
          <TabsTrigger value="izin">Daftar Izin</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan">
          {/* Paste logic renderSummaryTab dari versi refactor kita sebelumnya di sini */}
          {/* Ini akan kosong jika dbData (rawRequests) tidak dikirim dari backend */}
        </TabsContent>
        <TabsContent value="cuti">{/* renderCutiTab */}</TabsContent>
        <TabsContent value="izin">{/* renderIzinTab */}</TabsContent>
      </Tabs>
    </div>
  );
}
