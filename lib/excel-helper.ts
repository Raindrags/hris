import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export interface WorkShiftDetail {
  dayOfWeek: number;
  checkIn: string;
  checkOut: string;
  [key: string]: any;
}

export interface AttendanceLog {
  date: string;
  dayName: string;
  isSpecialWorkDay: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  in: string | null;
  out: string | null;
  lateDuration: string;
  earlyLeaveDuration: string;
  isLateApproved?: boolean;
  isEarlyApproved?: boolean;
  isAbsent: boolean;
  status: string;
  leaveType?: string | null;
  leaveCategory?: string | null;
  partialLeave?: {
    type: string;
    timeRange: string;
  } | null;
}

export interface EmployeeReport {
  id: string;
  name: string;
  niy: string | null;
  jabatan: string | null;
  isGuruRole: boolean;
  divisiId?: number | string; // Tambahkan divisiId di sini
  shiftName: string;
  checkIn: string;
  checkOut: string;
  summary: any;
  logs: AttendanceLog[];
  workShiftDetails?: WorkShiftDetail[];
  workShift?: {
    details?: WorkShiftDetail[];
  };
}

const getStatusStyle = (
  leaveType: string | null,
  leaveCategory?: string | null,
) => {
  if (!leaveType) return null;

  let bgColor = "FFEEEEEE";
  let textColor = "FF000000";

  const category = (leaveCategory || "").toLowerCase();
  const type = leaveType.toLowerCase();

  if (type === "cuti") {
    bgColor = "FFD9EAF7";
    textColor = "FF1E429F";
  } else if (type === "izin") {
    if (category.includes("sakit")) {
      bgColor = "FFDCF5E6";
      textColor = "FF0E6245";
    } else {
      bgColor = "FFF0E6F7";
      textColor = "FF6A0DAD";
    }
  }
  return { bgColor, textColor };
};

export const exportAttendanceToExcel = async (
  dataToExport: EmployeeReport[],
  startDate: string,
  endDate: string,
) => {
  if (dataToExport.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rekap Absensi", {
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  worksheet.columns = [
    { width: 4 },
    { width: 11 },
    { width: 7 },
    { width: 7 },
    { width: 10 },
    { width: 10 },
    { width: 2 }, // Spacer column
    { width: 4 },
    { width: 11 },
    { width: 7 },
    { width: 7 },
    { width: 10 },
    { width: 10 },
  ];

  let currentRow = 1;

  const applyBorder = (cell: ExcelJS.Cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  };

  const translateDay = (dayName: string) => {
    const days: Record<string, string> = {
      Sunday: "MINGGU",
      Monday: "SENIN",
      Tuesday: "SELASA",
      Wednesday: "RABU",
      Thursday: "KAMIS",
      Friday: "JUMAT",
      Saturday: "SABTU",
    };
    return days[dayName] || dayName.toUpperCase();
  };

  const formatTime = (time: string | null) =>
    time ? time.substring(0, 5) : "";

  // ==== PEMBUATAN TEKS HEADER SHIFT DENGAN KONDISI DIVISI ====
  const generateShiftHeader = (emp: EmployeeReport) => {
    const hariKerja = emp.isGuruRole ? 22 : 25;
    const roleText = emp.isGuruRole ? "GURU" : "STAFF";

    // Jam Fallback Default Utama
    let mainShift = "07:30-16:00";
    let secondaryShift = "";

    if (emp.isGuruRole) {
      if (String(emp.divisiId) === "1") {
        secondaryShift = "SABTU 07:30-14:00";
      } else {
        secondaryShift = "PARENTING 08:00-11:30";
      }
    } else {
      secondaryShift = "SABTU 07:30-16:00";
    }

    const details = emp.workShiftDetails || emp.workShift?.details || [];

    if (details && details.length > 0) {
      const weekday = details.find((d) => d.dayOfWeek === 1);
      if (weekday) {
        mainShift = `${formatTime(weekday.checkIn)}-${formatTime(weekday.checkOut)}`;
      }

      const saturday = details.find((d) => d.dayOfWeek === 6);
      if (saturday) {
        if (emp.isGuruRole) {
          if (String(emp.divisiId) === "1") {
            secondaryShift = `SABTU ${formatTime(saturday.checkIn)}-${formatTime(saturday.checkOut)}`;
          } else {
            secondaryShift = `PARENTING ${formatTime(saturday.checkIn)}-${formatTime(saturday.checkOut)}`;
          }
        } else {
          secondaryShift = `SABTU ${formatTime(saturday.checkIn)}-${formatTime(saturday.checkOut)}`;
        }
      }
    }

    if (secondaryShift !== "") {
      return `${roleText} ${hariKerja} HARI KERJA : ${mainShift} / ${secondaryShift}`;
    }

    return `${roleText} ${hariKerja} HARI KERJA : ${mainShift}`;
  };
  for (let i = 0; i < dataToExport.length; i += 2) {
    const emp1 = dataToExport[i];
    const emp2 = dataToExport[i + 1];

    const shiftText1 = generateShiftHeader(emp1);
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const shiftCell1 = worksheet.getCell(`A${currentRow}`);
    shiftCell1.value = shiftText1;
    shiftCell1.font = { bold: true, size: 8, name: "Arial" };
    shiftCell1.alignment = { horizontal: "center", vertical: "middle" };

    if (emp2) {
      const shiftText2 = generateShiftHeader(emp2);
      worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
      const shiftCell2 = worksheet.getCell(`H${currentRow}`);
      shiftCell2.value = shiftText2;
      shiftCell2.font = { bold: true, size: 8, name: "Arial" };
      shiftCell2.alignment = { horizontal: "center", vertical: "middle" };
    }
    currentRow++;

    // ==== NAMA PEGAWAI ====
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      `${emp1.name.toUpperCase()}/${emp1.niy || "-"}/${emp1.jabatan?.toUpperCase() || "-"}`;
    worksheet.getCell(`A${currentRow}`).font = {
      bold: true,
      size: 8,
      name: "Arial",
    };

    if (emp2) {
      worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
      worksheet.getCell(`H${currentRow}`).value =
        `${emp2.name.toUpperCase()}/${emp2.niy || "-"}/${emp2.jabatan?.toUpperCase() || "-"}`;
      worksheet.getCell(`H${currentRow}`).font = {
        bold: true,
        size: 8,
        name: "Arial",
      };
    }
    currentRow++;

    // ==== HEADER KOLOM TABEL ====
    const headers = [
      "DAYS",
      "DATE",
      "IN",
      "OUT",
      "LATE",
      "EARLY",
      "",
      "DAYS",
      "DATE",
      "IN",
      "OUT",
      "LATE",
      "EARLY",
    ];
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = headers;
    for (let col = 1; col <= 13; col++) {
      if (col !== 7) {
        const cell = headerRow.getCell(col);
        cell.font = { bold: true, size: 8, name: "Arial" };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        applyBorder(cell);
      }
    }
    currentRow++;

    // ==== PERULANGAN DATA LOGS ====
    const dates1 = emp1.logs.map((l) => l.date);
    const dates2 = emp2 ? emp2.logs.map((l) => l.date) : [];
    const uniqueDates = Array.from(new Set([...dates1, ...dates2])).sort();

    // Loop berdasakan jumlah data terbanyak (merapatkan baris jika salah satu libur)
    const maxLogs = Math.max(emp1.logs.length, emp2 ? emp2.logs.length : 0);

    for (let d = 0; d < maxLogs; d++) {
      const log1 = emp1.logs[d];
      const log2 = emp2 ? emp2.logs[d] : null;
      const row = worksheet.getRow(currentRow);
      row.height = 12.5;

      // === RENDER ORANG 1 ===
      if (log1) {
        // Ambil penomoran index asli supaya hitungan hari tidak kacau ketika dilompati
        const dayNum = uniqueDates.indexOf(log1.date) + 1;
        row.getCell(1).value = dayNum;
        row.getCell(2).value = log1.date;

        let targetCell = row.getCell(3);
        let mergeRange = `C${currentRow}:F${currentRow}`;

        if (log1.isHoliday && !log1.in && !log1.isSpecialWorkDay) {
          targetCell.value = `LIBUR: ${log1.holidayName?.toUpperCase()}`;
          worksheet.mergeCells(mergeRange);
          targetCell.font = {
            bold: true,
            color: { argb: "FFFF0000" },
            size: 8,
            name: "Arial",
          };
          targetCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFE6E6" },
          };
        } else if (log1.leaveType && !log1.in) {
          const style = getStatusStyle(log1.leaveType, log1.leaveCategory);
          let leaveText = log1.leaveType;
          if (log1.leaveCategory) leaveText += ` (${log1.leaveCategory})`;
          targetCell.value = leaveText;
          worksheet.mergeCells(mergeRange);
          if (style) {
            targetCell.font = {
              bold: true,
              color: { argb: style.textColor },
              size: 8,
              name: "Arial",
            };
            targetCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: style.bgColor },
            };
          }
        } else if (!log1.in && log1.status === "ALPHA") {
          targetCell.value = "ALPA";
          worksheet.mergeCells(mergeRange);
          targetCell.font = {
            bold: true,
            color: { argb: "FFFF0000" },
            size: 8,
            name: "Arial",
          };
          targetCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFD9D9" },
          };
        } else if (!log1.in && log1.status === "DAY OFF") {
          targetCell.value = translateDay(log1.dayName);
          worksheet.mergeCells(mergeRange);
          targetCell.font = { size: 8, name: "Arial" };
        } else if (!log1.in && log1.isSpecialWorkDay) {
          targetCell.value = "DINAS";
          worksheet.mergeCells(mergeRange);
          targetCell.font = {
            bold: true,
            color: { argb: "FFB45F06" },
            size: 8,
            name: "Arial",
          };
          targetCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFE5CC" },
          };
        } else {
          row.getCell(3).value = log1.in ? log1.in.substring(0, 5) : "-";
          row.getCell(4).value = log1.out ? log1.out.substring(0, 5) : "-";
          row.getCell(5).value =
            log1.isLateApproved && log1.lateDuration !== "-"
              ? `izin - ${log1.lateDuration}`
              : log1.lateDuration !== "-"
                ? log1.lateDuration
                : "-";
          row.getCell(6).value =
            log1.isEarlyApproved && log1.earlyLeaveDuration !== "-"
              ? `izin - ${log1.earlyLeaveDuration}`
              : log1.earlyLeaveDuration !== "-"
                ? log1.earlyLeaveDuration
                : "-";

          if (log1.partialLeave) {
            row.getCell(3).note =
              `${log1.partialLeave.type}: ${log1.partialLeave.timeRange}`;
          }
        }
      } else {
        // Jika data kosong di bagian bawah, render tanpa teks (blank space)
        for (let col = 1; col <= 6; col++) row.getCell(col).value = "";
      }

      for (let c = 1; c <= 6; c++) {
        const cell = row.getCell(c);
        if (!cell.font) cell.font = { size: 8, name: "Arial" };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        // Terapkan border hanya jika ada log (mencegah border melayang di sel kosong)
        if (log1) applyBorder(cell);
      }

      // === RENDER ORANG 2 ===
      if (emp2) {
        if (log2) {
          const dayNum = uniqueDates.indexOf(log2.date) + 1;
          row.getCell(8).value = dayNum;
          row.getCell(9).value = log2.date;

          let targetCell = row.getCell(10);
          let mergeRange = `J${currentRow}:M${currentRow}`;

          if (log2.isHoliday && !log2.in && !log2.isSpecialWorkDay) {
            targetCell.value = `LIBUR: ${log2.holidayName?.toUpperCase()}`;
            worksheet.mergeCells(mergeRange);
            targetCell.font = {
              bold: true,
              color: { argb: "FFFF0000" },
              size: 8,
              name: "Arial",
            };
            targetCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFE6E6" },
            };
          } else if (log2.leaveType && !log2.in) {
            const style = getStatusStyle(log2.leaveType, log2.leaveCategory);
            let leaveText = log2.leaveType;
            if (log2.leaveCategory) leaveText += ` (${log2.leaveCategory})`;
            targetCell.value = leaveText;
            worksheet.mergeCells(mergeRange);
            if (style) {
              targetCell.font = {
                bold: true,
                color: { argb: style.textColor },
                size: 8,
                name: "Arial",
              };
              targetCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: style.bgColor },
              };
            }
          } else if (!log2.in && log2.status === "ALPHA") {
            targetCell.value = "ALPA";
            worksheet.mergeCells(mergeRange);
            targetCell.font = {
              bold: true,
              color: { argb: "FFFF0000" },
              size: 8,
              name: "Arial",
            };
            targetCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFD9D9" },
            };
          } else if (!log2.in && log2.status === "DAY OFF") {
            targetCell.value = translateDay(log2.dayName);
            worksheet.mergeCells(mergeRange);
            targetCell.font = { size: 8, name: "Arial" };
          } else if (!log2.in && log2.isSpecialWorkDay) {
            targetCell.value = "DINAS";
            worksheet.mergeCells(mergeRange);
            targetCell.font = {
              bold: true,
              color: { argb: "FFB45F06" },
              size: 8,
              name: "Arial",
            };
            targetCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFE5CC" },
            };
          } else {
            row.getCell(10).value = log2.in ? log2.in.substring(0, 5) : "-";
            row.getCell(11).value = log2.out ? log2.out.substring(0, 5) : "-";
            row.getCell(12).value =
              log2.isLateApproved && log2.lateDuration !== "-"
                ? `izin - ${log2.lateDuration}`
                : log2.lateDuration !== "-"
                  ? log2.lateDuration
                  : "-";
            row.getCell(13).value =
              log2.isEarlyApproved && log2.earlyLeaveDuration !== "-"
                ? `izin - ${log2.earlyLeaveDuration}`
                : log2.earlyLeaveDuration !== "-"
                  ? log2.earlyLeaveDuration
                  : "-";

            if (log2.partialLeave) {
              row.getCell(10).note =
                `${log2.partialLeave.type}: ${log2.partialLeave.timeRange}`;
            }
          }
        } else {
          // Jika data kosong di bagian bawah, render tanpa teks (blank space)
          for (let col = 8; col <= 13; col++) row.getCell(col).value = "";
        }

        for (let c = 8; c <= 13; c++) {
          const cell = row.getCell(c);
          if (!cell.font) cell.font = { size: 8, name: "Arial" };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          if (log2) applyBorder(cell);
        }
      }
      currentRow++;
    }

    currentRow += 2;
    if ((i / 2 + 1) % 2 === 0 && i + 2 < dataToExport.length) {
      worksheet.getRow(currentRow - 1).addPageBreak();
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Rekap_Absensi_${startDate}_sd_${endDate}.xlsx`);
};
