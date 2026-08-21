// app/hooks/useLeaveForm.ts

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { LeaveSubmitPayload, CalendarEventResponse } from "../types";

const getLocalYYYYMMDD = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export const useLeaveForm = (
  sisaCuti: number | string,
  userId?: string,
  onSuccess?: () => void,
  user?: any,
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState<string>("");

  const [holidays, setHolidays] = useState<string[]>([]);
  const [specialWorkDays, setSpecialWorkDays] = useState<string[]>([]);

  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [pendingPayload, setPendingPayload] =
    useState<LeaveSubmitPayload | null>(null);

  const sisaCutiNum = Number(sisaCuti) || 0;

  // 1. Fetch Data Hari Libur
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("/api/holidays");
        if (!res.ok) throw new Error("Gagal fetch holidays");
        const data = await res.json();

        let holidaysArray: string[] = [];
        const sourceData = Array.isArray(data) ? data : data?.data || [];

        holidaysArray = sourceData
          .map((item: CalendarEventResponse | string) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal ?? ""),
          )
          .filter(Boolean);

        setHolidays(holidaysArray);
      } catch (error) {
        setHolidays([]);
      }
    };
    fetchHolidays();
  }, []);

  useEffect(() => {
    const fetchSpecialWorkDays = async () => {
      try {
        const res = await fetch("/api/special-workdays");
        if (!res.ok) throw new Error("Gagal fetch special workdays");
        const responseData = await res.json();

        let daysSet = new Set<string>();
        const sourceData = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        sourceData.forEach((item: any) => {
          // 1. DAPATKAN ID DIVISI USER SAAT INI
          // Mengambil dari user.divisiId atau user.divisi.id
          const myDivisiId =
            typeof user?.divisi === "object" && user?.divisi !== null
              ? (user.divisi as any).id
              : user?.divisiId || user?.divisi;

          // 2. CEK APAKAH JADWAL INI UNTUK USER INI ATAU DIVISINYA?
          // Cek apakah userId ada di dalam array item.users
          const isUserAssigned =
            Array.isArray(item.users) &&
            item.users.some((u: any) => u.id === (userId || user?.id));

          // Cek apakah jadwal ini memiliki divisiId yang sama dengan myDivisiId
          const isDivisiAssigned = Boolean(
            myDivisiId &&
            item.divisiId &&
            String(item.divisiId) === String(myDivisiId),
          );

          // Cek alternatif: Jika backend mengembalikan object divisi, bukan divisiId
          const isDivisiObjAssigned = Boolean(
            myDivisiId &&
            item.divisi?.id &&
            String(item.divisi.id) === String(myDivisiId),
          );

          // Jika tidak masuk ke salah satu kriteria, lewati data ini.
          if (!isUserAssigned && !isDivisiAssigned && !isDivisiObjAssigned) {
            return;
          }

          // 3. PARSING TANGGAL KE FORMAT YYYY-MM-DD
          if (item.startDate && item.endDate) {
            const startStr = item.startDate.split("T")[0];
            const endStr = item.endDate.split("T")[0];

            const [sYear, sMonth, sDate] = startStr.split("-").map(Number);
            const [eYear, eMonth, eDate] = endStr.split("-").map(Number);

            let current = new Date(sYear, sMonth - 1, sDate);
            const end = new Date(eYear, eMonth - 1, eDate);

            while (current <= end) {
              const yyyy = current.getFullYear();
              const mm = String(current.getMonth() + 1).padStart(2, "0");
              const dd = String(current.getDate()).padStart(2, "0");

              daysSet.add(`${yyyy}-${mm}-${dd}`);
              current.setDate(current.getDate() + 1);
            }
          }
        });

        // Debugging: Cek isi Set di inspect element (Console) browser Anda
        console.log("Special Work Days User Ini:", Array.from(daysSet));

        setSpecialWorkDays(Array.from(daysSet));
      } catch (error) {
        console.error("Gagal menarik data jadwal kerja khusus:", error);
        setSpecialWorkDays([]);
      }
    };

    if (userId) {
      fetchSpecialWorkDays();
    }
  }, [userId]);

  // 3. Kalkulasi Hari
  const isHolidayOrSunday = (date: Date): boolean => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    if (specialWorkDays.includes(dateString)) return false;
    if (date.getDay() === 0) return true;
    return holidays.includes(dateString);
  };

  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const lastDate = new Date(endDate);
    lastDate.setHours(0, 0, 0, 0);

    if (lastDate < currentDate) return -1;

    let count = 0;
    while (currentDate <= lastDate) {
      if (!isHolidayOrSunday(currentDate)) count++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, holidays, specialWorkDays]);

  const excessDays =
    calculatedDays > sisaCutiNum ? calculatedDays - sisaCutiNum : 0;

  const processSubmit = async (payload: LeaveSubmitPayload) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const bodyPayload = {
        ...payload,
        userId: userId || undefined,
      };

      const res = await fetch("/api/cuti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        toast.success("Pengajuan cuti berhasil dikirim.");
        onSuccess?.(); // Ini yang akan menutup modal
      } else {
        // Ambil pesan error dari backend jika ada
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Gagal mengajukan cuti.");
      }
    } catch (error) {
      toast.error("Gagal mengirim data. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
      setShowWarning(false);
      setPendingPayload(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate)
      return toast.error("Silakan pilih tanggal mulai dan selesai.");
    if (calculatedDays < 0)
      return toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    if (calculatedDays === 0)
      return toast.error("Durasi 0 hari. Anda hanya memilih hari libur.");
    if (!reason.trim()) return toast.error("Silakan isi alasan cuti Anda.");

    const payload: LeaveSubmitPayload = {
      startDate: getLocalYYYYMMDD(startDate),
      endDate: getLocalYYYYMMDD(endDate),
      reason,
      userId,
    };

    if (excessDays > 0) {
      setPendingPayload(payload);
      setShowWarning(true);
    } else {
      processSubmit(payload);
    }
  };

  return {
    // States
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    showWarning,
    setShowWarning,
    pendingPayload,
    setPendingPayload,

    // Calculated values
    sisaCutiNum,
    calculatedDays,
    excessDays,
    isHolidayOrSunday,

    // Handlers
    handleSubmit,
    processSubmit,
  };
};
