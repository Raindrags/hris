import React from "react";

export default function AdminHelpdeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 font-mono selection:bg-emerald-500/30">
      {/* Background Grid Pattern (Opsional untuk estetika sci-fi) */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
