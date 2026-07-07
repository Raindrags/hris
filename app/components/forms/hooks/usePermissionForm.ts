import { useState, useEffect, useMemo, FormEvent } from "react";
import { toast } from "sonner";
import {
  PermissionUserData,
  SubstituteUser,
  PermissionSubmitPayload,
} from "../types/permission";

interface UsePermissionFormProps {
  user: PermissionUserData;
  potentialSubstitutes: SubstituteUser[];
  onSuccess: () => void;
  userId?: string;
}

const getLocalYYYYMMDD = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export const usePermissionForm = ({
  user,
  potentialSubstitutes,
  onSuccess,
  userId,
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
  const [file, setFile] = useState<File | null>(null);

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
    if (sub.id === user?.id) return false;

    const myDivisi = user?.divisi;
    const subDivisi = sub?.divisi;

    const myDivisiName =
      typeof myDivisi === "object" && myDivisi !== null
        ? myDivisi.name // Jika bentuknya objek { name: "IT" }
        : myDivisi; // Jika bentuknya string "IT"

    const subDivisiName =
      typeof subDivisi === "object" && subDivisi !== null
        ? subDivisi.name
        : subDivisi;

    if (!myDivisiName || !subDivisiName) return false;

    return (
      String(subDivisiName).toLowerCase() === String(myDivisiName).toLowerCase()
    );
  });

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

  useEffect(() => {
    const fetchSpecialWorkDays = async () => {
      try {
        const res = await fetch("/api/special-workdays");
        if (!res.ok) throw new Error("Gagal fetch");
        const data = await res.json();
        let daysArray: string[] = [];
        if (Array.isArray(data)) {
          daysArray = data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        } else if (data?.data && Array.isArray(data.data)) {
          daysArray = data.data.map((item: any) =>
            typeof item === "string" ? item : (item.date ?? item.tanggal),
          );
        }
        setSpecialWorkDays(daysArray);
      } catch (error) {
        setSpecialWorkDays([]);
      }
    };
    fetchSpecialWorkDays();
  }, []);

  useEffect(() => {
    if (category === "IzinKhusus" && subCategory && startDate) {
      const newEndDate = new Date(startDate);
      let isAutoSet = true;
      switch (subCategory) {
        case "IstriMelahirkan":
        case "MenikahkanAnak":
          newEndDate.setDate(newEndDate.getDate() + 1);
          break;
        case "Menikah":
        case "KeluargaMeninggal":
          newEndDate.setDate(newEndDate.getDate() + 4);
          break;
        case "WisudaBaptis":
        case "Bencana":
          break;
        case "Melahirkan":
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          newEndDate.setDate(newEndDate.getDate() - 1);
          break;
        default:
          isAutoSet = false;
          break;
      }
      if (isAutoSet) setEndDate(newEndDate);
    }
  }, [category, subCategory, startDate]);

  useEffect(() => {
    const fetchSubstitutes = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Gagal fetch users");
        const responseData = await res.json();

        // 🚀 Gunakan Smart Extractor yang sama dengan halaman Admin Anda
        let usersData: SubstituteUser[] = [];

        if (Array.isArray(responseData)) {
          usersData = responseData;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          usersData = responseData.data;
        } else if (
          responseData?.data?.data &&
          Array.isArray(responseData.data.data)
        ) {
          usersData = responseData.data.data;
        } else if (responseData?.users && Array.isArray(responseData.users)) {
          usersData = responseData.users;
        }

        setSubstitutesList(usersData);
      } catch (error) {
        console.error("Gagal menarik data rekan pengganti:", error);
        setSubstitutesList([]);
      }
    };
    fetchSubstitutes();
  }, []);

  const isHolidayOrSunday = (date: Date) => {
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
      if (payload.file) formDataObj.append("file", payload.file);
      if (userId) formDataObj.append("userId", userId);
      if (payload.delegatedToId)
        formDataObj.append("delegatedToId", payload.delegatedToId);
      if (payload.taskDetail)
        formDataObj.append("taskDetail", payload.taskDetail);

      const res = await fetch("/api/izin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      if (res.ok) {
        toast.success("Pengajuan izin berhasil dikirim.");
        onSuccess(); // Ini yang akan menutup form modal Anda
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
    if (!startDate || !endDate)
      return toast.error("Mohon pilih tanggal mulai dan selesai.");
    if (calculatedDays < 0)
      return toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    if (!category) return toast.error("Mohon pilih jenis izin.");
    if (category === "IzinKhusus" && !subCategory)
      return toast.error("Mohon pilih detail izin khusus.");
    if ((category === "Terlambat" || category === "PulangAwal") && !timeValue)
      return toast.error("Mohon masukkan jam/waktu yang sesuai.");
    if (category === "Sakit" && calculatedDays > 1 && !file)
      return toast.error(
        "Mohon lampirkan surat dokter untuk izin sakit > 1 hari.",
      );
    if (!reason.trim()) return toast.error("Mohon isi keterangan lengkap.");

    const finalData: PermissionSubmitPayload = {
      startDate: getLocalYYYYMMDD(startDate),
      endDate: getLocalYYYYMMDD(endDate),
      reason,
      category,
      subCategory: category === "IzinKhusus" ? subCategory : null,
      time:
        category === "Terlambat" || category === "PulangAwal"
          ? timeValue
          : null,
      file: category === "Sakit" && calculatedDays > 1 ? file : null,
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
    if (safeVal !== "Terlambat" && safeVal !== "PulangAwal") setTimeValue("");
  };
  const isAutoEndDate =
    category === "IzinKhusus" &&
    [
      "IstriMelahirkan",
      "Menikah",
      "WisudaBaptis",
      "MenikahkanAnak",
      "KeluargaMeninggal",
      "Melahirkan",
    ].includes(subCategory);

  return {
    states: {
      loading,
      startDate,
      endDate,
      category,
      subCategory,
      timeValue,
      reason,
      delegatedTo,
      taskDetail,
      showWarning,
      pendingPayload,
      calculatedDays,
      filteredSubstitutes,
      isAutoEndDate,
    },
    actions: {
      setStartDate,
      setEndDate,
      setSubCategory,
      setTimeValue,
      setReason,
      setFile,
      setDelegatedTo,
      setTaskDetail,
      setShowWarning,
      setPendingPayload,
      handleCategoryChange,
      isHolidayOrSunday,
      handleSubmit,
      processSubmit,
    },
  };
};
