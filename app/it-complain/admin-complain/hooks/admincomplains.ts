import { useState, useEffect, useCallback } from "react";
import {
  AdminComplaint,
  ActionLog,
  DashboardStats,
  ComplaintStatus,
} from "../type";

// Menggunakan endpoint relatif (Proxy API Next.js)
const API_BASE_URL = "/api/it-helpdesk/admin";

export const useAdminHelpdesk = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "logs">(
    "dashboard",
  );
  const [activeTab, setActiveTab] = useState<ComplaintStatus>("NEW");

  const [stats, setStats] = useState<DashboardStats>({
    masuk: 0,
    dikerjakan: 0,
    selesai: 0,
  });
  const [filteredComplaints, setFilteredComplaints] = useState<
    AdminComplaint[]
  >([]);
  const [filteredLogs, setFilteredLogs] = useState<ActionLog[]>([]);

  const [selectedTicket, setSelectedTicket] = useState<AdminComplaint | null>(
    null,
  );
  const [modalType, setModalType] = useState<
    "TERIMA" | "SELESAI" | "DETAIL" | "BATAL" | null
  >(null);
  const [dikerjakanOleh, setDikerjakanOleh] = useState("");
  const [formSelesai, setFormSelesai] = useState({
    solusi: "",
    saran: "",
    keterangan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [logSearch, setLogSearch] = useState("");
  const [logDate, setLogDate] = useState("");

  // 1. Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (error) {
      console.error("Gagal memuat statistik", error);
    }
  };

  // 2. Fetch Complaints (Termasuk tanggalKejadian CCTV, rating, dan ulasanUser)
  const fetchComplaints = useCallback(async () => {
    try {
      // Kamus penerjemah dari nama Tab di UI Admin ke Enum Status di Backend/Prisma
      const statusMap: Record<string, string> = {
        NEW: "PENDING",
        IN_PROGRESS: "DIPROSES",
        WAITING_CONFIRMATION: "MENUNGGU_KONFIRMASI",
        COMPLETED: "SELESAI",
        CANCELLED: "BATAL",
      };

      const backendStatus = statusMap[activeTab];
      const res = await fetch(
        `${API_BASE_URL}/complaints?status=${backendStatus}`,
      );

      const data = await res.json();
      const rawData = Array.isArray(data) ? data : data?.data || [];

      const mappedData: AdminComplaint[] = rawData.map((item: any) => ({
        id: item.id,
        kodeTiket: item.tiketkomplain,
        type: item.type,
        kategoriIT: item.kategoriIT || null,
        lokasi: item.lokasiIT || item.titikLokasi || "-",
        tanggalKejadian: item.tanggalKejadian || null,
        perkiraanJam: item.perkiraanJam || null,
        divisi: item.user?.divisi?.name || "-",
        masalah: item.masalah,
        status: activeTab,
        rawStatus: item.status,
        pelapor: item.user?.name || "Unknown",
        niy: item.user?.niy || "-",
        dikerjakanOleh: item.dikerjakanOleh || null,
        solusi: item.solusi || null,
        saran: item.saran || null,
        keterangan: item.keterangan || null,
        rating: item.rating ?? null,
        ulasanUser: item.ulasanUser || null,
        confirmedAt: item.confirmedAt || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setFilteredComplaints(mappedData);
    } catch (error) {
      console.error("Gagal memuat daftar keluhan", error);
    }
  }, [activeTab]);

  // 3. Fetch Logs
  const fetchLogs = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (logSearch) query.append("search", logSearch);
      if (logDate) query.append("date", logDate);

      const res = await fetch(`${API_BASE_URL}/logs?${query.toString()}`);

      const data = await res.json();
      const rawData = Array.isArray(data) ? data : data?.data || [];

      const mappedLogs: ActionLog[] = rawData.map((item: any) => ({
        id: item.id,
        kodeTiket: item.tiketkomplain,
        action: item.status,
        actor: item.dikerjakanOleh || "System Admin",
        timestamp: item.updatedAt,
        message: `Status diubah menjadi ${item.status}`,
      }));

      setFilteredLogs(mappedLogs);
    } catch (error) {
      console.error("Gagal memuat log", error);
    }
  }, [logSearch, logDate]);

  useEffect(() => {
    if (activeView === "dashboard") {
      fetchStats();
      fetchComplaints();
    } else {
      fetchLogs();
    }
  }, [activeView, activeTab, fetchComplaints, fetchLogs]);

  // 4. Update Status (PATCH) dengan pengunci isSubmitting
  const handleAction = async () => {
    if (!selectedTicket || isSubmitting) return;

    let payloadStatus = "";
    if (modalType === "TERIMA") payloadStatus = "DIPROSES";
    // Saat admin klik Konfirm Selesai, status menjadi MENUNGGU_KONFIRMASI agar user bisa memberi rating
    if (modalType === "SELESAI") payloadStatus = "MENUNGGU_KONFIRMASI";
    if (modalType === "BATAL") payloadStatus = "BATAL";

    const payload = {
      status: payloadStatus,
      dikerjakanOleh:
        modalType === "TERIMA" ? dikerjakanOleh : selectedTicket.dikerjakanOleh,
      ...(modalType === "SELESAI" && formSelesai),
    };

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/complaint/${selectedTicket.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        closeModal();
        fetchStats();
        fetchComplaints();
      } else {
        const err = await res.json();
        console.error(`Gagal mengeksekusi: ${err.message || err.error}`);
      }
    } catch (error) {
      console.error("Terjadi kesalahan jaringan.", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (ticket: AdminComplaint, type: typeof modalType) => {
    setSelectedTicket(ticket);
    setModalType(type);
    setDikerjakanOleh(ticket.dikerjakanOleh || "");
    setFormSelesai({ solusi: "", saran: "", keterangan: "" });
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setSelectedTicket(null);
    setModalType(null);
  };

  return {
    activeView,
    setActiveView,
    activeTab,
    setActiveTab,
    stats,
    filteredComplaints,
    filteredLogs,
    selectedTicket,
    modalType,
    openModal,
    closeModal,
    dikerjakanOleh,
    setDikerjakanOleh,
    formSelesai,
    setFormSelesai,
    isSubmitting,
    logSearch,
    setLogSearch,
    logDate,
    setLogDate,
    handleAction,
  };
};