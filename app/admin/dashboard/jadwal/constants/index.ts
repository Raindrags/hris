import { ShiftDetail } from "../types";

export const DAYS = [
  { id: 1, name: "Senin" },
  { id: 2, name: "Selasa" },
  { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" },
  { id: 5, name: "Jumat" },
  { id: 6, name: "Sabtu" },
  { id: 0, name: "Minggu" },
];

export const generateDefaultDetails = (): ShiftDetail[] =>
  DAYS.map((d) => ({
    dayOfWeek: d.id,
    dayName: d.name,
    isActive: d.id >= 1 && d.id <= 5, // Senin-Jumat aktif
    checkIn: "07:30",
    checkOut: "16:00",
  }));