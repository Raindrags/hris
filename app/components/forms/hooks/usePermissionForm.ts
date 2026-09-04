import { useState, useEffect, useMemo, useCallback, FormEvent } from "react";
import { toast } from "sonner";
import {
  PermissionUserData,
  SubstituteUser,
  PermissionSubmitPayload,
} from "../types/permission";

interface UsePermissionFormProps {
  user: PermissionUserData & { workShift?: any };
  potentialSubstitutes: SubstituteUser[];
  onSuccess: () => void;
  userId?: string;
  allowBackdate?: boolean;
}

const getLocalYYYYMMDD = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export const usePermissionForm = ({
  user,
  onSuccess,
  userId,
  allowBackdate = false,
}: UsePermissionFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [holidays, setHolidays] = useState<string[]>([]);
  const [specialWorkDays, setSpecialWorkDays] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  // State untuk No FP
  const [fpDatang, setFpDatang] = useState<boolean>(false);
  const [fpPulang, setFpPulang] = useState<boolean>(false);
  const [lupaFp, setLupaFp] = useState<boolean>(false);
  const [errorFp, setErrorFp] = useState<boolean>(false);
  const [jamDatang, setJamDatang] = useState<string>("");
  const [jamPulang, setJamPulang] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [attachmentLink, setAttachmentLink] = useState<string>("");

  // State untuk Izin Sakit
  const [isSakitHariPertama, setIsSakitHariPertama] = useState<boolean>(false);
  const [isSakitHariBerikutnya, setIsSakitHariBerikutnya] =
    useState<boolean>(false);
  const [suratTerlampir, setSuratTerlampir] = useState<boolean>(false);
  const [suratTidakTerlampir, setSuratTidakTerlampir] =
    useState<boolean>(false);

  // State khusus riwayat sakit backend
  const [hasSickHistory, setHasSickHistory] = useState<boolean | null>(null);
  const [isLoadingSickHistory, setIsLoadingSickHistory] =
    useState<boolean>(false);

  const [returnTime, setReturnTime] = useState<string>("");
  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [taskDetail, setTaskDetail] = useState<string>("");
  const [substitutesList, setSubstitutesList] = useState<SubstituteUser[]>([]);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [pendingPayload, setPendingPayload] =
    useState<PermissionSubmitPayload | null>(null);

  const safeSubstitutesList = Array.isArray(substitutesList)
    ? substitutesList
    : [];
  const filteredSubstitutes = safeSubstitutesList.filter((sub) => {
    if (sub.id === (userId || user?.id)) return false;
    const myDivisi = user?.divisi;
    const subDivisi = sub?.divisi;
    const myDivisiName =
      typeof myDivisi === "object" && myDivisi !== null
        ? myDivisi.name
        : myDivisi;
    const subDivisiName =
      typeof subDivisi === "object" && subDivisi !== null
        ? subDivisi.name
        : subDivisi;
    if (!myDivisiName || !subDivisiName) return false;
    return (
      String(subDivisiName).toLowerCase() === String(myDivisiName).toLowerCase()
    );
  });

  // Ambil Hari Libur
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("/api/holidays");
        if (!res.ok) throw new Error("Gagal fetch");
        const data = await res.json();
        let holidaysArray: string[] = [];
        if (Array.isArray(data)) {
          holidaysArray = data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        } else if (data?.data && Array.isArray(data.data)) {
          holidaysArray = data.data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        }
        setHolidays(holidaysArray);
      } catch (error) {
        setHolidays([]);
      }
    };
    fetchHolidays();
  }, []);

  // Ambil Special Workdays
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
          const myDivisiId =
            typeof user?.divisi === "object" && user?.divisi !== null
              ? (user.divisi as any).id
              : user?.divisiId || user?.divisi;

          const isUserAssigned =
            Array.isArray(item.users) &&
            item.users.some((u: any) => u.id === (userId || user?.id));

          const isDivisiAssigned = Boolean(
            myDivisiId &&
            item.divisiId &&
            String(item.divisiId) === String(myDivisiId),
          );

          const isDivisiObjAssigned = Boolean(
            myDivisiId &&
            item.divisi?.id &&
            String(item.divisi.id) === String(myDivisiId),
          );

          if (!isUserAssigned && !isDivisiAssigned && !isDivisiObjAssigned) {
            return;
          }

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
        setSpecialWorkDays(Array.from(daysSet));
      } catch (error) {
        setSpecialWorkDays([]);
      }
    };

    if (userId || user?.id) fetchSpecialWorkDays();
  }, [userId, user]);

  useEffect(() => {
    if (
      ["NoFP", "Terlambat", "PulangAwal", "IzinKeluar"].includes(category) &&
      startDate
    ) {
      setEndDate(startDate);
    }
  }, [category, startDate]);

  const workingDays = useMemo(() => {
    if (user?.workShift?.details && Array.isArray(user.workShift.details)) {
      return user.workShift.details.map((detail: any) => detail.dayOfWeek);
    }
    return [1, 2, 3, 4, 5];
  }, [user]);

  const isHolidayOrSunday = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const currentDayOfWeek = date.getDay();

      if (specialWorkDays.includes(dateString)) return false;
      if (!workingDays.includes(currentDayOfWeek)) return true;
      return holidays.includes(dateString);
    },
    [specialWorkDays, workingDays, holidays],
  );

  // Cek Riwayat Sakit
  useEffect(() => {
    if (category === "Sakit" && isSakitHariBerikutnya) {
      const fetchSickHistory = async () => {
        setIsLoadingSickHistory(true);
        try {
          const res = await fetch(
            `/api/requests/${userId || user?.id}/get-last-sick/`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.startDate) {
              setHasSickHistory(true);
              const backendDate = new Date(data.startDate);
              setStartDate(backendDate);
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              yesterday.setHours(0, 0, 0, 0);
              setEndDate(yesterday);
            } else {
              setHasSickHistory(false);
            }
          } else {
            setHasSickHistory(false);
          }
        } catch (error) {
          setHasSickHistory(false);
        } finally {
          setIsLoadingSickHistory(false);
        }
      };
      fetchSickHistory();
    } else {
      setHasSickHistory(null);
    }
  }, [category, isSakitHariBerikutnya, userId, user?.id]);

  // Sinkronisasi otomatis Tanggal Selesai untuk No FP
  useEffect(() => {
    if (category === "NoFP" && startDate) {
      setEndDate(startDate);
    }
  }, [category, startDate]);

  // Perhitungan Izin Khusus
  useEffect(() => {
    if (category === "IzinKhusus" && subCategory && startDate) {
      if (subCategory === "Pegawai melahirkan (2 Bulan kalender)") {
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + 59);
        setEndDate(newEndDate);
      } else {
        const daysMap: Record<string, number> = {
          "Pegawai menikah (5 Hari)": 5,
          "Pegawai menikahkan anaknya (2 Hari)": 2,
          "Pegawai mengkhitankan/membaptiskan anaknya/Wisuda/meja hijau (1 Hari)": 1,
          "Istri pegawai melahirkan/keguguran kandungan (2 Hari)": 2,
          "Suami/istri/anak/orang tua/mertua/menantu/saudara kandung meninggal dunia (5 Hari)": 5,
          "Force Majeur/musibah bencana alam (1 Hari)": 1,
        };

        const duration = daysMap[subCategory] || 1;
        let currentDate = new Date(startDate);
        let daysCount = 1;

        while (daysCount < duration) {
          currentDate.setDate(currentDate.getDate() + 1);
          if (!isHolidayOrSunday(currentDate)) {
            daysCount++;
          }
        }
        setEndDate(new Date(currentDate));
      }
    }
  }, [category, subCategory, startDate, isHolidayOrSunday]);

  // Perhitungan Durasi
  const calculatedDays = useMemo(() => {
    if (!startDate) return 0;
    let effEndDate = endDate;
    if ((category === "Sakit" && isSakitHariPertama) || category === "NoFP") {
      effEndDate = startDate;
    }
    if (!effEndDate) return 0;

    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const lastDate = new Date(effEndDate);
    lastDate.setHours(0, 0, 0, 0);

    if (lastDate < currentDate) return -1;

    let count = 0;
    const isMaternityLeave =
      category === "IzinKhusus" &&
      subCategory === "Pegawai melahirkan (2 Bulan)";

    while (currentDate <= lastDate) {
      if (isMaternityLeave) {
        count++;
      } else {
        if (!isHolidayOrSunday(currentDate)) {
          count++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  }, [
    startDate,
    endDate,
    category,
    subCategory,
    isSakitHariPertama,
    isHolidayOrSunday,
  ]);

  const processSubmit = async (payload: PermissionSubmitPayload) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formDataObj = new FormData();
      formDataObj.append(
        "startDate",
        new Date(payload.startDate).toISOString(),
      );
      formDataObj.append("endDate", new Date(payload.endDate).toISOString());
      formDataObj.append("reason", payload.reason);
      formDataObj.append("category", payload.category);

      if (payload.subCategory)
        formDataObj.append("subCategory", payload.subCategory);
      if (payload.time) formDataObj.append("time", payload.time);
      if (userId) formDataObj.append("userId", userId);
      if (payload.delegatedToId)
        formDataObj.append("delegatedToId", payload.delegatedToId);
      if (payload.taskDetail)
        formDataObj.append("taskDetail", payload.taskDetail);
      if (payload.returnTime)
        formDataObj.append("returnTime", payload.returnTime);

      // Kirim attachment jika ada
      if (payload.file) formDataObj.append("file", payload.file);
      if (payload.attachmentLink)
        formDataObj.append("attachmentLink", payload.attachmentLink);

      formDataObj.append("durationDays", String(calculatedDays));
      if (payload.category === "Sakit") {
        formDataObj.append(
          "sakitType",
          isSakitHariBerikutnya ? "hari berikutnya" : "hari pertama",
        );
        formDataObj.append("isSuratDokter", suratTerlampir ? "true" : "false");
      }

      if (payload.category === "NoFP") {
        formDataObj.append("fpDatang", String(fpDatang));
        formDataObj.append("fpPulang", String(fpPulang));
        if (jamDatang) formDataObj.append("time", jamDatang);
        if (jamPulang) formDataObj.append("returnTime", jamPulang);
      }

      const res = await fetch("/api/izin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      if (res.ok) {
        toast.success("Pengajuan izin berhasil dikirim.");
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Gagal mengajukan izin.");
      }
    } catch (error) {
      toast.error("Gagal memproses pengajuan. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
      setShowWarning(false);
      setPendingPayload(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!category) return toast.error("Mohon pilih jenis izin.");

    if (category === "Sakit") {
      if (!isSakitHariPertama && !isSakitHariBerikutnya)
        return toast.error("Mohon centang salah satu pilihan hari sakit.");
      if (isSakitHariBerikutnya && hasSickHistory === false)
        return toast.error(
          "Tidak dapat mengajukan, riwayat sakit sebelumnya tidak ditemukan.",
        );
      if (isSakitHariBerikutnya && calculatedDays > 1) {
        if (!suratTerlampir && !suratTidakTerlampir)
          return toast.error(
            "Mohon pilih status lampiran surat dokter karena durasi lebih dari 1 hari.",
          );
      }
    }

    if (category === "NoFP") {
      if (!lupaFp && !errorFp)
        return toast.error("Mohon pilih alasan No FP (Lupa FP atau Error FP).");
      if (!fpDatang && !fpPulang)
        return toast.error(
          "Mohon pilih minimal satu waktu: FP Datang atau FP Pulang.",
        );
      if (fpDatang && !jamDatang)
        return toast.error("Mohon masukkan Jam Datang Seharusnya.");
      if (fpPulang && !jamPulang)
        return toast.error("Mohon masukkan Jam Pulang Seharusnya.");
      if (!reason.trim())
        return toast.error("Mohon isi keterangan/alasan No FP.");
      if (!file && !attachmentLink)
        return toast.error("Mohon unggah foto bukti atau sertakan link foto.");
    }

    if (
      !startDate ||
      (!endDate &&
        !(category === "Sakit" && isSakitHariPertama) &&
        category !== "NoFP")
    )
      return toast.error("Mohon pilih tanggal mulai dan selesai.");

    if (calculatedDays < 0)
      return toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    if (category === "IzinKhusus" && !subCategory)
      return toast.error("Kategori Izin Khusus wajib dipilih.");

    if (
      ["Terlambat", "PulangAwal", "IzinKeluar"].includes(category) &&
      !timeValue
    )
      return toast.error("Mohon masukkan jam keluar/masuk.");
    if (category === "IzinKeluar" && !returnTime)
      return toast.error("Mohon masukkan jam kembali untuk Izin Keluar.");
    if (!(category === "Sakit" && isSakitHariBerikutnya) && !reason.trim())
      return toast.error("Mohon isi keterangan lengkap.");

    const finalData: PermissionSubmitPayload = {
      startDate: getLocalYYYYMMDD(startDate as Date),
      endDate:
        (category === "Sakit" && isSakitHariPertama) || category === "NoFP"
          ? getLocalYYYYMMDD(startDate as Date)
          : getLocalYYYYMMDD(endDate as Date),
      reason:
        category === "Sakit" && isSakitHariBerikutnya
          ? "Sakit hari berikutnya (Lanjutan)"
          : reason,
      category,
      subCategory:
        category === "IzinKhusus"
          ? subCategory
          : category === "NoFP"
            ? [lupaFp ? "Lupa FP" : "", errorFp ? "Error FP" : ""]
                .filter(Boolean)
                .join(" & ")
            : null,
      time: ["Terlambat", "PulangAwal", "IzinKeluar"].includes(category)
        ? timeValue
        : null,
      returnTime: category === "IzinKeluar" ? returnTime : null,
      file: file,
      attachmentLink: attachmentLink || null,
      delegatedToId: delegatedTo || null,
      taskDetail: taskDetail || null,
    };

    if (category === "Izin") {
      setPendingPayload(finalData);
      setShowWarning(true);
    } else {
      processSubmit(finalData);
    }
  };

  const handleCategoryChange = (val: string | null) => {
    const safeVal = val ?? "";
    setCategory(safeVal);
    if (safeVal !== "IzinKhusus") setSubCategory("");
    if (!["Terlambat", "PulangAwal", "IzinKeluar"].includes(safeVal)) {
      setTimeValue("");
    }
    setReturnTime("");
    setFpDatang(false);
    setFpPulang(false);
    setLupaFp(false);
    setErrorFp(false);
    setJamDatang("");
    setJamPulang("");
    setFile(null);
    setAttachmentLink("");
    setIsSakitHariPertama(false);
    setIsSakitHariBerikutnya(false);
    setSuratTerlampir(false);
    setSuratTidakTerlampir(false);
    setHasSickHistory(null);
  };

  const isAutoEndDate = category === "IzinKhusus";

  return {
    states: {
      loading,
      startDate,
      endDate,
      category,
      subCategory,
      timeValue,
      returnTime,
      reason,
      delegatedTo,
      taskDetail,
      showWarning,
      pendingPayload,
      calculatedDays,
      filteredSubstitutes,
      isAutoEndDate,
      fpDatang,
      fpPulang,
      lupaFp,
      errorFp,
      jamDatang,
      jamPulang,
      file,
      attachmentLink,
      isSakitHariPertama,
      isSakitHariBerikutnya,
      suratTerlampir,
      suratTidakTerlampir,
      hasSickHistory,
      isLoadingSickHistory,
      allowBackdate,
    },
    actions: {
      setStartDate,
      setEndDate,
      setSubCategory,
      setTimeValue,
      setReturnTime,
      setReason,
      setDelegatedTo,
      setTaskDetail,
      setShowWarning,
      setPendingPayload,
      handleCategoryChange,
      isHolidayOrSunday,
      handleSubmit,
      processSubmit,
      setFpDatang,
      setFpPulang,
      setLupaFp,
      setErrorFp,
      setJamDatang,
      setJamPulang,
      setFile,
      setAttachmentLink,
      setIsSakitHariPertama,
      setIsSakitHariBerikutnya,
      setSuratTerlampir,
      setSuratTidakTerlampir,
    },
  };
};
