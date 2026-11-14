import { useState, useEffect, useCallback } from "react";
import {
  ComplaintSubmission,
  UserIdentity,
  ITComplaintData,
  CCTVComplaintData,
  ComplaintType,
} from "../type";

const API_BASE_URL = "/api/it-helpdesk";

export const useComplaint = (initialUser?: {
  nama: string;
  niy: string;
  divisi: string;
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [formType, setFormType] = useState<ComplaintType>("IT");

  const [userIdentity, setUserIdentity] = useState<UserIdentity>({
    nama: initialUser?.nama || "Memuat...",
    niy: initialUser?.niy || "Memuat...",
    divisi: initialUser?.divisi || "Memuat...",
  });

  const [itData, setItData] = useState<ITComplaintData>({
    masalah: "",
    kategori: "",
    lokasi: "",
  });

  const [cctvData, setCctvData] = useState<CCTVComplaintData>({
    titikLokasi: "",
    tanggalKejadian: "",
    perkiraanJam: "",
    masalah: "",
  });

  const [history, setHistory] = useState<ComplaintSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lastTicketCode, setLastTicketCode] = useState<string>("");
  const [submittedTicket, setSubmittedTicket] =
    useState<ComplaintSubmission | null>(null);

  // 1. Ambil Identitas User dari Proxy /api/it-helpdesk/me
  useEffect(() => {
    if (initialUser && initialUser.nama) {
      setUserIdentity({
        nama: initialUser.nama,
        niy: initialUser.niy || "-",
        divisi: initialUser.divisi || "-",
      });
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/me`);
        if (res.ok) {
          const raw = await res.json();
          const profile = raw?.data || raw;
          setUserIdentity({
            nama: profile.nama || profile.name || "-",
            niy: profile.niy || "-",
            divisi: profile.divisi?.name || profile.divisi || "-",
          });
        } else {
          setUserIdentity({
            nama: "Sesi Habis",
            niy: "-",
            divisi: "-",
          });
        }
      } catch (error) {
        console.error("Gagal memuat identitas user:", error);
        setUserIdentity({
          nama: "Gagal Memuat",
          niy: "-",
          divisi: "-",
        });
      }
    };

    fetchUserProfile();
  }, [initialUser?.nama, initialUser?.niy, initialUser?.divisi]);

  const isUserLoaded =
    userIdentity.nama !== "Memuat..." &&
    userIdentity.nama !== "Sesi Habis" &&
    userIdentity.nama !== "Gagal Memuat";

  // 2. Fetch History -> GET /api/it-helpdesk/history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);

      if (res.ok) {
        const rawResponse = await res.json();
        const dataList = Array.isArray(rawResponse)
          ? rawResponse
          : Array.isArray(rawResponse?.data)
            ? rawResponse.data
            : [];

        const transformedHistory: ComplaintSubmission[] = dataList.map(
          (item: any) => ({
            id: item.id,
            kodeTiket: item.tiketkomplain || item.kodeTiket || item.id,
            type: item.type,
            user: {
              nama: item.user?.name || userIdentity.nama,
              niy: item.user?.niy || userIdentity.niy,
              divisi: item.user?.divisi?.name || userIdentity.divisi,
            },
            data:
              item.type === "IT"
                ? {
                    masalah: item.masalah,
                    kategori: item.kategoriIT,
                    lokasi: item.lokasiIT,
                  }
                : {
                    masalah: item.masalah,
                    titikLokasi: item.titikLokasi,
                    tanggalKejadian: item.tanggalKejadian || "",
                    perkiraanJam: item.perkiraanJam,
                  },
            status: item.status,
            dikerjakanOleh: item.dikerjakanOleh || null,
            solusi: item.solusi || null,
            saran: item.saran || null,
            keterangan: item.keterangan || null,
            rating: item.rating ?? null,
            ulasanUser: item.ulasanUser || null,
            confirmedAt: item.confirmedAt || null,
            createdAt: new Date(item.createdAt),
            updatedAt: item.updatedAt
              ? new Date(item.updatedAt)
              : new Date(item.createdAt),
          }),
        );

        setHistory(transformedHistory);
      }
    } catch (error) {
      console.error("Gagal memuat histori keluhan:", error);
    }
  }, [userIdentity.nama, userIdentity.niy, userIdentity.divisi]);

  useEffect(() => {
    if (isUserLoaded) {
      fetchHistory();
    }
  }, [isUserLoaded, fetchHistory]);

  // 3. Submit Complaint -> POST /api/it-helpdesk/complaint (Dengan pengunci isSubmitting)
  const submitComplaint = async () => {
    if (isSubmitting) return null;

    if (!isUserLoaded) {
      setModalMessage("Gagal memuat identitas. Silakan muat ulang halaman.");
      setIsModalOpen(true);
      return null;
    }

    if (
      formType === "IT" &&
      (!itData.masalah || !itData.kategori || !itData.lokasi)
    ) {
      setModalMessage("Mohon lengkapi semua field pada Keluhan IT.");
      setIsModalOpen(true);
      return null;
    }

    if (
      formType === "CCTV" &&
      (!cctvData.titikLokasi ||
        !cctvData.tanggalKejadian ||
        !cctvData.perkiraanJam ||
        !cctvData.masalah)
    ) {
      setModalMessage("Mohon lengkapi semua field pada Cek CCTV.");
      setIsModalOpen(true);
      return null;
    }

    const payload = {
      type: formType,
      user: userIdentity,
      data: formType === "IT" ? itData : cctvData,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setModalMessage(
          result.message ||
            result.error ||
            "Terjadi kesalahan pada validasi server.",
        );
        setIsModalOpen(true);
        return null;
      }

      const item = result?.data?.data || result?.data || result;
      const ticketCode =
        item?.tiketkomplain ||
        item?.kodeTiket ||
        result?.tiketkomplain ||
        item?.id ||
        "";

      const newSubmission: ComplaintSubmission = {
        id: item.id,
        kodeTiket: ticketCode,
        type: item.type || formType,
        user: {
          nama: item.user?.name || userIdentity.nama,
          niy: item.user?.niy || userIdentity.niy,
          divisi: item.user?.divisi?.name || userIdentity.divisi,
        },
        data:
          (item.type || formType) === "IT"
            ? {
                masalah: item.masalah || itData.masalah,
                kategori: item.kategoriIT || itData.kategori,
                lokasi: item.lokasiIT || itData.lokasi,
              }
            : {
                masalah: item.masalah || cctvData.masalah,
                titikLokasi: item.titikLokasi || cctvData.titikLokasi,
                tanggalKejadian:
                  item.tanggalKejadian || cctvData.tanggalKejadian,
                perkiraanJam: item.perkiraanJam || cctvData.perkiraanJam,
              },
        status: item.status || "PENDING",
        dikerjakanOleh: item.dikerjakanOleh || null,
        solusi: item.solusi || null,
        saran: item.saran || null,
        keterangan: item.keterangan || null,
        rating: item.rating ?? null,
        ulasanUser: item.ulasanUser || null,
        confirmedAt: item.confirmedAt || null,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      };

      setLastTicketCode(ticketCode);
      setSubmittedTicket(newSubmission);
      setHistory((prev) => [newSubmission, ...prev]);

      setModalMessage(
        `Berhasil! Nomor tiket Anda: ${ticketCode}. Pesan WhatsApp otomatis sedang diteruskan ke Admin IT.`,
      );
      setIsModalOpen(true);

      setItData({ masalah: "", kategori: "", lokasi: "" });
      setCctvData({
        titikLokasi: "",
        tanggalKejadian: "",
        perkiraanJam: "",
        masalah: "",
      });

      return newSubmission;
    } catch (error) {
      setModalMessage("Terjadi kesalahan jaringan saat menyambung ke server.");
      setIsModalOpen(true);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Confirm Complaint & Rating -> PATCH /api/it-helpdesk/complaint/:id/confirm
  const confirmComplaint = async (
    id: string,
    rating: number,
    ulasanUser?: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaint/${id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, ulasanUser }),
      });

      const result = await response.json();

      if (!response.ok) {
        setModalMessage(
          result.message ||
            result.error ||
            "Gagal mengirim konfirmasi penyelesaian.",
        );
        setIsModalOpen(true);
        return false;
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "SELESAI",
                rating,
                ulasanUser: ulasanUser || null,
                confirmedAt: new Date(),
                updatedAt: new Date(),
              }
            : item,
        ),
      );

      setModalMessage(
        "Konfirmasi selesai dan rating pelayanan berhasil dikirim!",
      );
      setIsModalOpen(true);
      return true;
    } catch (error) {
      setModalMessage("Terjadi kesalahan jaringan saat mengirim konfirmasi.");
      setIsModalOpen(true);
      return false;
    }
  };

  return {
    activeTab,
    setActiveTab,
    formType,
    setFormType,
    userIdentity,
    itData,
    setItData,
    cctvData,
    setCctvData,
    submitComplaint,
    isSubmitting,
    history,
    isModalOpen,
    setIsModalOpen,
    modalMessage,
    lastTicketCode,
    submittedTicket,
    confirmComplaint,
  };
};