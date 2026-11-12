import { useState, useEffect } from "react";
import {
  ComplaintSubmission,
  UserIdentity,
  ITComplaintData,
  CCTVComplaintData,
  ComplaintType,
} from "../types/complaint"; // Sesuaikan path ini dengan struktur folder Anda

// Helper untuk membaca cookie
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

// Helper untuk ekstrak token (cek localStorage dulu, jika tidak ada cek cookie)
const getAccessToken = () => {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("access_token");
    if (local) return local;
  }
  return getCookie("access_token");
};

// Helper untuk mencegah error React Child Object {id, name}
const safelyExtractString = (data: any, fallback: string) => {
  if (!data) return fallback;
  if (typeof data === "object" && data !== null) {
    return data.name || fallback;
  }
  return String(data);
};

export const useComplaint = (initialUser?: {
  nama: any;
  niy: string;
  divisi: any;
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [formType, setFormType] = useState<ComplaintType>("IT");

  const [userIdentity, setUserIdentity] = useState<UserIdentity>({
    nama: safelyExtractString(initialUser?.nama, "Memuat..."),
    niy: initialUser?.niy || "Memuat...",
    divisi: safelyExtractString(initialUser?.divisi, "Memuat..."),
  });

  const [itData, setItData] = useState<ITComplaintData>({
    masalah: "",
    kategori: "",
    lokasi: "",
  });

  const [cctvData, setCctvData] = useState<CCTVComplaintData>({
    titikLokasi: "",
    perkiraanJam: "",
    masalah: "",
  });

  const [history, setHistory] = useState<ComplaintSubmission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 1. Ambil data dari Cookie saat komponen pertama kali dimuat
  useEffect(() => {
    const userDataStr = getCookie("user_data");
    if (userDataStr) {
      try {
        const decodedData = decodeURIComponent(userDataStr);
        const parsedUser = JSON.parse(decodedData);

        setUserIdentity({
          nama: safelyExtractString(parsedUser.name, "Pengguna"),
          niy: parsedUser.niy || "-",
          divisi: safelyExtractString(parsedUser.divisi, "-"),
        });
      } catch (error) {
        console.error("Gagal melakukan parse cookie user_data:", error);
      }
    }
  }, []);

  // 2. Sinkronisasi data user jika props initialUser dari parent berubah
  useEffect(() => {
    if (initialUser && initialUser.niy) {
      setUserIdentity({
        nama: safelyExtractString(initialUser.nama, "Memuat..."),
        niy: initialUser.niy,
        divisi: safelyExtractString(initialUser.divisi, "Memuat..."),
      });
    }
  }, [initialUser?.nama, initialUser?.niy, initialUser?.divisi]);

  // 3. Fetch histori keluhan dari backend NestJS
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/it-helpdesk/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          const transformedHistory = data.map((item: any) => ({
            id: item.id,
            type: item.type,
            user: userIdentity,
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
                    perkiraanJam: item.perkiraanJam,
                  },
            status: item.status,
            createdAt: new Date(item.createdAt),
          }));
          setHistory(transformedHistory);
        }
      } catch (error) {
        console.error("Gagal memuat histori keluhan:", error);
      }
    };

    if (userIdentity.niy !== "Memuat...") {
      fetchHistory();
    }
  }, [userIdentity.niy]);

  const submitComplaint = async () => {
    if (!userIdentity.niy || userIdentity.niy === "Memuat...") {
      setModalMessage("Gagal memuat identitas. Silakan muat ulang halaman.");
      setIsModalOpen(true);
      return;
    }

    if (
      formType === "IT" &&
      (!itData.masalah || !itData.kategori || !itData.lokasi)
    ) {
      setModalMessage("Mohon lengkapi semua field pada Keluhan IT.");
      setIsModalOpen(true);
      return;
    }

    if (
      formType === "CCTV" &&
      (!cctvData.titikLokasi || !cctvData.perkiraanJam || !cctvData.masalah)
    ) {
      setModalMessage("Mohon lengkapi semua field pada Cek CCTV.");
      setIsModalOpen(true);
      return;
    }

    const payload = {
      type: formType,
      user: userIdentity,
      data: formType === "IT" ? itData : cctvData,
    };

    try {
      const token = getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/it-helpdesk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setModalMessage(
          result.error || "Terjadi kesalahan pada validasi server.",
        );
        setIsModalOpen(true);
        return;
      }

      const newSubmission: ComplaintSubmission = {
        id: result.data.id,
        type: result.data.type,
        user: userIdentity,
        data:
          result.data.type === "IT"
            ? {
                masalah: result.data.masalah,
                kategori: result.data.kategoriIT,
                lokasi: result.data.lokasiIT,
              }
            : {
                masalah: result.data.masalah,
                titikLokasi: result.data.titikLokasi,
                perkiraanJam: result.data.perkiraanJam,
              },
        status: result.data.status,
        createdAt: new Date(result.data.createdAt),
      };

      setHistory((prev) => [newSubmission, ...prev]);
      setModalMessage(
        `Berhasil! Pesan WhatsApp otomatis sedang diteruskan ke Admin IT.`,
      );
      setIsModalOpen(true);

      setItData({ masalah: "", kategori: "", lokasi: "" });
      setCctvData({ titikLokasi: "", perkiraanJam: "", masalah: "" });
    } catch (error) {
      setModalMessage("Terjadi kesalahan jaringan saat menyambung ke server.");
      setIsModalOpen(true);
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
    history,
    isModalOpen,
    setIsModalOpen,
    modalMessage,
  };
};
