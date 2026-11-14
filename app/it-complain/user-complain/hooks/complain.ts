import { useState, useEffect } from "react";
import {
  ComplaintSubmission,
  UserIdentity,
  ITComplaintData,
  CCTVComplaintData,
  ComplaintType,
} from "../type";

// Helper untuk membaca cookie user_data yang httpOnly: false
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
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

  // 1. Ambil data user dari Cookie
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

  // 2. Sinkronisasi data user dari initialUser props
  useEffect(() => {
    if (initialUser && initialUser.niy) {
      setUserIdentity({
        nama: safelyExtractString(initialUser.nama, "Memuat..."),
        niy: initialUser.niy,
        divisi: safelyExtractString(initialUser.divisi, "Memuat..."),
      });
    }
  }, [initialUser?.nama, initialUser?.niy, initialUser?.divisi]);

  // 3. Fetch histori keluhan melalui proxy rute Next.js API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/it-helpdesk/history");

        if (res.ok) {
          const data = await res.json();
          // Antisipasi jika API mereturn properti bersarang
          const rawData = Array.isArray(data) ? data : data?.data || [];

          const transformedHistory = rawData.map((item: any) => ({
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
      (!cctvData.titikLokasi || !cctvData.perkiraanJam || !cctvData.masalah)
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

    try {
      const response = await fetch("/api/it-helpdesk/complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setModalMessage(
          result.error || result.message || "Terjadi kesalahan pada server.",
        );
        setIsModalOpen(true);
        return null;
      }

      const resData = result.data ? result.data : result;

      // Masukkan ke state history agar terupdate di UI secara realtime
      const newSubmission: ComplaintSubmission = {
        id: resData.tiketkomplain || resData.kode || resData.id,
        type: resData.type,
        user: userIdentity,
        data:
          resData.type === "IT"
            ? {
                masalah: resData.masalah,
                kategori: resData.kategoriIT || resData.kategori,
                lokasi: resData.lokasiIT || resData.lokasi,
              }
            : {
                masalah: resData.masalah,
                titikLokasi: resData.titikLokasi,
                perkiraanJam: resData.perkiraanJam,
              },
        status: resData.status || "PENDING",
        createdAt: new Date(resData.createdAt || new Date()),
      };

      setHistory((prev) => [newSubmission, ...prev]);

      // Kosongkan form kembali
      setItData({ masalah: "", kategori: "", lokasi: "" });
      setCctvData({ titikLokasi: "", perkiraanJam: "", masalah: "" });

      // Kembalikan result untuk dibaca oleh page.tsx (agar ID Tiket bisa ditangkap modal)
      return result;
    } catch (error) {
      setModalMessage("Terjadi kesalahan jaringan saat menyambung ke server.");
      setIsModalOpen(true);
      return null;
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
