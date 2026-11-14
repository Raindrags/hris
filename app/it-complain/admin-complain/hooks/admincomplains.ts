import { useState, useMemo } from "react";
import {
  AdminComplaint,
  ActionLog,
  DashboardStats,
  ComplaintStatus,
} from "../types/admin-helpdesk";

export const useAdminHelpdesk = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "logs">(
    "dashboard",
  );
  const [activeTab, setActiveTab] = useState<ComplaintStatus>("NEW");

  // State untuk form & modal
  const [selectedTicket, setSelectedTicket] = useState<AdminComplaint | null>(
    null,
  );
  const [modalType, setModalType] = useState<
    "TERIMA" | "SELESAI" | "DETAIL" | "BATAL" | null
  >(null);

  // Form States
  const [dikerjakanOleh, setDikerjakanOleh] = useState("");
  const [formSelesai, setFormSelesai] = useState({
    solusi: "",
    saran: "",
    keterangan: "",
  });

  // Filter Logs
  const [logSearch, setLogSearch] = useState("");
  const [logDate, setLogDate] = useState("");

  // ==========================================
  // SIMULASI DATA (Ganti dengan fetch ke backend nanti)
  // ==========================================
  const [complaints, setComplaints] = useState<AdminComplaint[]>([
    {
      id: "1",
      kodeTiket: "IT-202310-001",
      lokasi: "Gedung A, Lt 2",
      divisi: "Keuangan",
      masalah: "Printer tidak bisa connect",
      status: "NEW",
      pelapor: "Budi",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      kodeTiket: "IT-202310-002",
      lokasi: "Gedung B, Lt 1",
      divisi: "HRD",
      masalah: "Internet mati",
      status: "IN_PROGRESS",
      pelapor: "Siti",
      dikerjakanOleh: "Agus IT",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [logs, setLogs] = useState<ActionLog[]>([
    {
      id: "L1",
      kodeTiket: "IT-202310-001",
      action: "TICKET_CREATED",
      actor: "Budi",
      timestamp: new Date().toISOString(),
      message: "Tiket keluhan baru dibuat.",
    },
  ]);

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================
  const stats: DashboardStats = {
    masuk: complaints.filter((c) => c.status === "NEW").length,
    dikerjakan: complaints.filter((c) => c.status === "IN_PROGRESS").length,
    selesai: complaints.filter((c) => c.status === "COMPLETED").length,
  };

  const filteredComplaints = complaints.filter((c) => c.status === activeTab);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.kodeTiket.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.message.toLowerCase().includes(logSearch.toLowerCase());
      const matchDate = logDate ? log.timestamp.startsWith(logDate) : true;
      return matchSearch && matchDate;
    });
  }, [logs, logSearch, logDate]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const openModal = (ticket: AdminComplaint, type: typeof modalType) => {
    setSelectedTicket(ticket);
    setModalType(type);
    setDikerjakanOleh("");
    setFormSelesai({ solusi: "", saran: "", keterangan: "" });
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setModalType(null);
  };

  const handleAction = () => {
    if (!selectedTicket) return;

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== selectedTicket.id) return c;

        let newStatus = c.status;
        if (modalType === "TERIMA") newStatus = "IN_PROGRESS";
        if (modalType === "SELESAI") newStatus = "WAITING_CONFIRMATION";
        if (modalType === "BATAL") newStatus = "CANCELLED";

        return {
          ...c,
          status: newStatus,
          dikerjakanOleh:
            modalType === "TERIMA" ? dikerjakanOleh : c.dikerjakanOleh,
        };
      }),
    );

    // Tambah Log
    setLogs((prev) => [
      {
        id: Date.now().toString(),
        kodeTiket: selectedTicket.kodeTiket,
        action: modalType || "UNKNOWN",
        actor: modalType === "TERIMA" ? dikerjakanOleh : "System Admin",
        timestamp: new Date().toISOString(),
        message: `Status diubah menjadi ${modalType}`,
      },
      ...prev,
    ]);

    closeModal();
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
