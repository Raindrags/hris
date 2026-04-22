// lib/excel-helper.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportAttendanceToExcel = async (
  dataToExport: any[],
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

    const dates1 = emp1.logs.map((l: any) => l.date);
    const dates2 = emp2 ? emp2.logs.map((l: any) => l.date) : [];
    const uniqueDates = Array.from(new Set([...dates1, ...dates2])).sort();

    for (let d = 0; d < uniqueDates.length; d++) {
      const currentDate = uniqueDates[d] as string;
      const log1 = emp1.logs.find((l: any) => l.date === currentDate);
      const log2 = emp2
        ? emp2.logs.find((l: any) => l.date === currentDate)
        : null;
      const row = worksheet.getRow(currentRow);
      row.height = 12.5;

      // ============================================
      // RENDER ORANG 1
      // ============================================
      if (log1) {
        row.getCell(1).value = d + 1;
        row.getCell(2).value = log1.date;

        if (log1.isHoliday && !log1.in && !log1.isSpecialWorkDay) {
          row.getCell(3).value = `LIBUR: ${log1.holidayName?.toUpperCase()}`;
          worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
          row.getCell(3).font = {
            bold: true,
            color: { argb: "FFFF0000" },
            size: 8,
            name: "Arial",
          };
        } else if (!log1.in && log1.status === "DAY OFF") {
          row.getCell(3).value = translateDay(log1.dayName);
          worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
        } else if (!log1.in && log1.isSpecialWorkDay) {
          row.getCell(3).value = "DINAS";
          worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
        } else {
          row.getCell(3).value = log1.in ? log1.in.substring(0, 5) : "-";
          row.getCell(4).value = log1.out ? log1.out.substring(0, 5) : "-";
          row.getCell(5).value =
            log1.lateDuration !== "-" ? log1.lateDuration : "-";
          row.getCell(6).value =
            log1.earlyLeaveDuration !== "-" ? log1.earlyLeaveDuration : "-";
        }
      } else {
        for (let col = 1; col <= 6; col++) row.getCell(col).value = "-";
      }
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

          if (log2.isHoliday && !log2.in && !log2.isSpecialWorkDay) {
            row.getCell(10).value = `LIBUR: ${log2.holidayName?.toUpperCase()}`;
            worksheet.mergeCells(`J${currentRow}:M${currentRow}`);
            row.getCell(10).font = {
              bold: true,
              color: { argb: "FFFF0000" },
              size: 8,
              name: "Arial",
            };
          } else if (!log2.in && log2.status === "DAY OFF") {
            row.getCell(10).value = translateDay(log2.dayName);
            worksheet.mergeCells(`J${currentRow}:M${currentRow}`);
          } else if (!log2.in && log2.isSpecialWorkDay) {
            row.getCell(10).value = "DINAS";
            worksheet.mergeCells(`J${currentRow}:M${currentRow}`);
          } else {
            row.getCell(10).value = log2.in ? log2.in.substring(0, 5) : "-";
            row.getCell(11).value = log2.out ? log2.out.substring(0, 5) : "-";
            row.getCell(12).value =
              log2.lateDuration !== "-" ? log2.lateDuration : "-";
            row.getCell(13).value =
              log2.earlyLeaveDuration !== "-" ? log2.earlyLeaveDuration : "-";
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
