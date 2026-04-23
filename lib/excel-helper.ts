// lib/excel-helper.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Type definitions
interface AttendanceLog {
  date: string;
  dayName: string;
  isSpecialWorkDay: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  in: string | null;
  out: string | null;
  lateDuration: string;
  earlyLeaveDuration: string;
  isAbsent: boolean;
  status: string;
  leaveType?: string | null;
  leaveCategory?: string | null;
  partialLeave?: {
    type: string;
    timeRange: string;
  } | null;
}

interface EmployeeReport {
  id: string;
  name: string;
  niy: string | null;
  jabatan: string | null;
  isGuruRole: boolean;
  shiftName: string;
  checkIn: string;
  checkOut: string;
  summary: any;
  logs: AttendanceLog[];
}

// Helper untuk menentukan warna berdasarkan tipe cuti/izin
const getStatusStyle = (
  leaveType: string | null,
  leaveCategory?: string | null,
) => {
  if (!leaveType) return null;

  // Default colors
  let bgColor = "FFEEEEEE"; // abu-abu muda
  let textColor = "FF000000";

  const category = (leaveCategory || "").toLowerCase();
  const type = leaveType.toLowerCase();

  if (type === "cuti") {
    bgColor = "FFD9EAF7"; // biru muda
    textColor = "FF1E429F"; // biru tua
  } else if (type === "izin") {
    if (category.includes("sakit")) {
      bgColor = "FFDCF5E6"; // hijau muda
      textColor = "FF0E6245"; // hijau tua
    } else {
      bgColor = "FFF0E6F7"; // ungu muda
      textColor = "FF6A0DAD"; // ungu tua
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
    { width: 7 },
    { width: 7 },
    { width: 2 },
    { width: 4 },
    { width: 11 },
    { width: 7 },
    { width: 7 },
    { width: 7 },
    { width: 7 },
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

  const formatTime = (time: string) => (time ? time.substring(0, 5) : "");

  for (let i = 0; i < dataToExport.length; i += 2) {
    const emp1 = dataToExport[i];
    const emp2 = dataToExport[i + 1];

    // HEADER ORANG 1
    const shiftText1 = `${emp1.isGuruRole ? "GURU" : "STAFF"} 22 HARI KERJA : ${formatTime(emp1.checkIn)}-${formatTime(emp1.checkOut)} / ${emp1.isGuruRole ? "PARENTING 08:00-11:30" : `SABTU ${formatTime(emp1.checkIn)}-${formatTime(emp1.checkOut)}`}`;
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const shiftCell1 = worksheet.getCell(`A${currentRow}`);
    shiftCell1.value = shiftText1;
    shiftCell1.font = { bold: true, size: 8, name: "Arial" };
    shiftCell1.alignment = { horizontal: "center", vertical: "middle" };

    // HEADER ORANG 2
    if (emp2) {
      const shiftText2 = `${emp2.isGuruRole ? "GURU" : "STAFF"} 22 HARI KERJA : ${formatTime(emp2.checkIn)}-${formatTime(emp2.checkOut)} / ${emp2.isGuruRole ? "PARENTING 08:00-11:30" : `SABTU ${formatTime(emp2.checkIn)}-${formatTime(emp2.checkOut)}`}`;
      worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
      const shiftCell2 = worksheet.getCell(`H${currentRow}`);
      shiftCell2.value = shiftText2;
      shiftCell2.font = { bold: true, size: 8, name: "Arial" };
      shiftCell2.alignment = { horizontal: "center", vertical: "middle" };
    }
    currentRow++;

    // NAMA
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

    // TABLE HEADERS
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

    const dates1 = emp1.logs.map((l) => l.date);
    const dates2 = emp2 ? emp2.logs.map((l) => l.date) : [];
    const uniqueDates = Array.from(new Set([...dates1, ...dates2])).sort();

    for (let d = 0; d < uniqueDates.length; d++) {
      const currentDate = uniqueDates[d] as string;
      const log1 = emp1.logs.find((l) => l.date === currentDate);
      const log2 = emp2 ? emp2.logs.find((l) => l.date === currentDate) : null;
      const row = worksheet.getRow(currentRow);
      row.height = 12.5;

      // ============================================
      // RENDER ORANG 1
      // ============================================
      if (log1) {
        row.getCell(1).value = d + 1;
        row.getCell(2).value = log1.date;

        // Tentukan sel target untuk merge (kolom C sampai F)
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
            fgColor: { argb: "FFFFE6E6" }, // merah muda
          };
        } else if (log1.leaveType && !log1.in) {
          const style = getStatusStyle(log1.leaveType, log1.leaveCategory);
          let leaveText = log1.leaveType;
          if (log1.leaveCategory) {
            leaveText += ` (${log1.leaveCategory})`;
          }
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
          } else {
            targetCell.font = { bold: true, size: 8, name: "Arial" };
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
            color: { argb: "FFB45F06" }, // oranye tua
            size: 8,
            name: "Arial",
          };
          targetCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFE5CC" }, // oranye muda
          };
        } else {
          // Normal hadir atau setengah hari (ada tap)
          row.getCell(3).value = log1.in ? log1.in.substring(0, 5) : "-";
          row.getCell(4).value = log1.out ? log1.out.substring(0, 5) : "-";
          row.getCell(5).value =
            log1.lateDuration !== "-" ? log1.lateDuration : "-";
          row.getCell(6).value =
            log1.earlyLeaveDuration !== "-" ? log1.earlyLeaveDuration : "-";

          if (log1.partialLeave) {
            const note = `${log1.partialLeave.type}: ${log1.partialLeave.timeRange}`;
            row.getCell(3).note = note;
          }
        }
      } else {
        for (let col = 1; col <= 6; col++) row.getCell(col).value = "-";
      }

      // Apply border dan alignment untuk kolom 1-6
      for (let c = 1; c <= 6; c++) {
        const cell = row.getCell(c);
        if (!cell.font) cell.font = { size: 8, name: "Arial" };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        applyBorder(cell);
      }

      // ============================================
      // RENDER ORANG 2
      // ============================================
      if (emp2) {
        if (log2) {
          row.getCell(8).value = d + 1;
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
            if (log2.leaveCategory) {
              leaveText += ` (${log2.leaveCategory})`;
            }
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
            } else {
              targetCell.font = { bold: true, size: 8, name: "Arial" };
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
              log2.lateDuration !== "-" ? log2.lateDuration : "-";
            row.getCell(13).value =
              log2.earlyLeaveDuration !== "-" ? log2.earlyLeaveDuration : "-";

            if (log2.partialLeave) {
              const note = `${log2.partialLeave.type}: ${log2.partialLeave.timeRange}`;
              row.getCell(10).note = note;
            }
          }
        } else {
          for (let col = 8; col <= 13; col++) row.getCell(col).value = "-";
        }

        for (let c = 8; c <= 13; c++) {
          const cell = row.getCell(c);
          if (!cell.font) cell.font = { size: 8, name: "Arial" };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          applyBorder(cell);
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
