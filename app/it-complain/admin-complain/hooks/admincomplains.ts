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

  // 2. Fetch Complaints
  const fetchComplaints = useCallback(async () => {
    try {
      const statusMap: Record<string, string> = {
        NEW: "PENDING",
        IN_PROGRESS: "DIPROSES",
        WAITING_CONFIRMATION: "SELESAI",
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
        lokasi: item.lokasiIT || item.titikLokasi || "-",
        divisi: item.user?.divisi?.name || "-",
        masalah: item.masalah,
        status: activeTab,
        pelapor: item.user?.name || "Unknown",
        dikerjakanOleh: item.dikerjakanOleh,
        createdAt: item.createdAt,
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

  // 4. Update Status (PATCH)
  const handleAction = async () => {
    if (!selectedTicket) return;

    let payloadStatus = "";
    if (modalType === "TERIMA") payloadStatus = "DIPROSES";
    if (modalType === "SELESAI") payloadStatus = "SELESAI";
    if (modalType === "BATAL") payloadStatus = "BATAL";

    const payload = {
      status: payloadStatus,
      dikerjakanOleh:
        modalType === "TERIMA" ? dikerjakanOleh : selectedTicket.dikerjakanOleh,
      ...(modalType === "SELESAI" && formSelesai),
    };

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
        alert(`Gagal mengeksekusi: ${err.message || err.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const openModal = (ticket: AdminComplaint, type: typeof modalType) => {
    setSelectedTicket(ticket);
    setModalType(type);
    setDikerjakanOleh(ticket.dikerjakanOleh || "");
    setFormSelesai({ solusi: "", saran: "", keterangan: "" });
  };

  const closeModal = () => {
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
    logSearch,
    setLogSearch,
    logDate,
    setLogDate,
    handleAction,
  };
};
