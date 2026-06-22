// src/app/dashboard/layout.tsx

import { DashboardProvider } from "../context/DashboardContext";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Bungkus seluruh dashboard dengan Provider agar bisa saling berbagi data
    <DashboardProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
          <Topbar />
          <main className="p-8 max-w-[1200px] w-full mx-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}