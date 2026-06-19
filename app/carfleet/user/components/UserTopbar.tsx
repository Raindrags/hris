"use client";

import React from "react";
import { Car, Route, History } from "lucide-react";

interface UserTopbarProps {
  activeTab: "booking" | "nebeng" | "status";
  setActiveTab: React.Dispatch<React.SetStateAction<"booking" | "nebeng" | "status">>;
}

export function UserTopbar({ activeTab, setActiveTab }: UserTopbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-black text-[#1a365d]">Portal Armada</h1>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab("booking")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === "booking"
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Car className="w-4 h-4 hidden sm:block" /> Sewa
            </button>
            <button
              onClick={() => setActiveTab("nebeng")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === "nebeng"
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Route className="w-4 h-4 hidden sm:block" /> Nebeng/Titip
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === "status"
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <History className="w-4 h-4 hidden sm:block" /> Status
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}