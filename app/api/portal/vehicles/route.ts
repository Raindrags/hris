import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Nanti ini akan diubah menjadi fetch() ke endpoint NestJS
  // const res = await fetch('http://localhost:3000/vehicles');
  // const data = await res.json();

  // MOCK DATA sementara
  const mockVehicles = [
    {
      id: 1,
      name: "Toyota Hiace Commuter",
      plat_number: "B 1234 SCH",
      capacity: 15,
      type: "Pilihan Utama Rombongan",
      status: "Tersedia",
    },
    {
      id: 2,
      name: "Kijang Innova Reborn",
      plat_number: "B 5678 SCH",
      capacity: 7,
      type: "Perjalanan Dinas Standard",
      status: "Tersedia",
    },
  ];

  return NextResponse.json({ success: true, data: mockVehicles });
}
