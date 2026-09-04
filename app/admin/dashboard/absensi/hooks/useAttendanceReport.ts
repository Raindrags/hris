import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Division, EmployeeReport, AttendanceLog } from "../types";
import { API_BASE_URL, ITEMS_PER_PAGE } from "../constants";

export function useAttendanceReport() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [divisiId, setDivisiId] = useState<string>("all");

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [reportData, setReportData] = useState<EmployeeReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await fetch("/api/division");
        const res = await response.json();
        if (res.success && res.data) setDivisions(res.data);
      } catch (error) {
        console.error("Fetch divisions error:", error);
      }
    };

    fetchDivisions();
    const today = format(new Date(), "yyyy-MM-dd");
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleGenerateReport = useCallback(async () => {
    if (!startDate || !endDate) {
      alert("Pilih tanggal mulai dan tanggal akhir terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);

    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (divisiId && divisiId !== "all") params.append("divisiId", divisiId);

      const response = await fetch(
        `${API_BASE_URL}/attendance/report?${params.toString()}`,
      );
      const res = await response.json();

      if (res.success && res.data) {
        const processedData = res.data.map((emp: any) => {
          const isFlexible = emp.isFlexible === true;

          const isMonFriShift =
            !isFlexible &&
            (emp.workShift?.name?.toLowerCase().includes("jumat") ||
              emp.shiftType === "Senin-Jumat" ||
              (emp.workShift?.details &&
                !emp.workShift.details.some((d: any) => d.dayOfWeek === 6)));

          const processedLogs = emp.logs
            .map((log: AttendanceLog) => {
              const updatedLog = { ...log };

              if (isFlexible) {
                if (updatedLog.isHoliday) {
                  updatedLog.isHoliday = false;
                  if (!updatedLog.in) {
                    updatedLog.status = "Alpha";
                  } else {
                    updatedLog.status = "";
                  }
                }
              }

              const isSaturdayOff =
                updatedLog.dayName === "Saturday" && isMonFriShift;
              const isPublicHoliday = updatedLog.isHoliday;

              // Hapus isSunday dari paksaan pengosongan status agar tidak menimpa data
              if (
                !isFlexible &&
                (isSaturdayOff || isPublicHoliday) &&
                !updatedLog.isSpecialWorkDay
              ) {
                updatedLog.in = "";
                updatedLog.out = "";
                updatedLog.status = isPublicHoliday ? "Libur" : "Sabtu";
              } else if (
                !isFlexible &&
                updatedLog.dayName === "Saturday" &&
                !updatedLog.isSpecialWorkDay &&
                updatedLog.status?.toLowerCase() === "alpha"
              ) {
                updatedLog.status = "Sabtu";
              }

              return updatedLog;
            })
            .filter((log: AttendanceLog) => {
              if (isFlexible) return true;

              // Hapus logika isSundayOff sepenuhnya.
              // Percayakan penyaringan hari Minggu sepenuhnya pada data mentah backend.
              const isSaturdayOffForMonFri =
                log.dayName === "Saturday" &&
                !log.in &&
                !log.isSpecialWorkDay &&
                isMonFriShift;

              return !isSaturdayOffForMonFri;
            });

          return { ...emp, logs: processedLogs };
        });

        setReportData(processedData);
      } else {
        alert(res.error || "Gagal mengambil data laporan.");
      }
    } catch (error) {
      console.error("Fetch report error:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, divisiId]);

  const filteredReportData = useMemo(() => {
    if (!debouncedSearch) return reportData;
    const lowerQuery = debouncedSearch.toLowerCase();
    return reportData.filter(
      (emp) =>
        emp.name.toLowerCase().includes(lowerQuery) ||
        (emp.niy?.toLowerCase() || "").includes(lowerQuery),
    );
  }, [reportData, debouncedSearch]);

  const totalPages = Math.ceil(filteredReportData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReportData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredReportData, currentPage]);

  return {
    state: {
      startDate,
      endDate,
      divisiId,
      divisions,
      isLoading,
      searchQuery,
      currentPage,
      totalPages,
      reportData,
      filteredReportData,
      paginatedData,
    },
    actions: {
      setStartDate,
      setEndDate,
      setDivisiId,
      setSearchQuery,
      setCurrentPage,
      handleGenerateReport,
    },
  };
}
