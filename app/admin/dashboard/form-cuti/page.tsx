// app/admin/form-cuti/page.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  User,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Komponen dan Hooks
import { LeaveForm } from "@/app/components/forms/cuti-form";
import { useAdminLeaveForm } from "@/app/form-cuti/hooks/useAdminLeaveForm";

export default function AdminFormCutiPage() {
  const router = useRouter();

  // Ambil semua state dan actions dari custom hook
  const {
    open,
    setOpen,
    search,
    handleSearchChange,
    page,
    handlePageChange,
    totalPages,
    selectedUser,
    showForm,
    userDetail,
    pagedUsers,
    handleSelectUser,
    handleAjukan,
  } = useAdminLeaveForm();

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 text-slate-100 font-sans">
      {/* Decorative Ambient Backgrounds */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Card berdesain Glassmorphism */}
        <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/40 rounded-3xl overflow-visible transition-all duration-500">
          <CardHeader className="space-y-3 pb-8 border-b border-slate-700/50 bg-slate-800/30 px-6 sm:px-8 pt-8 rounded-t-3xl">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Pengajuan Cuti{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Pegawai
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Pilih pegawai yang akan diajukan cuti, lalu klik tombol Ajukan
              untuk melengkapi formulir persetujuan.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-8 px-6 sm:px-8 pb-8">
            {/* Area Pencarian */}
            <div className="space-y-3">
              <Label className="text-slate-300 font-medium ml-1 block">
                Cari Pegawai
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-14 px-5 rounded-2xl bg-slate-950/50 border border-slate-700 hover:bg-slate-800/80 hover:text-white transition-all text-base font-normal shadow-inner"
                  >
                    {selectedUser ? (
                      <span className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-slate-800">
                          <User className="h-4 w-4 text-indigo-400" />
                        </div>
                        <span className="font-medium text-slate-200">
                          {selectedUser.name}
                        </span>
                        <span className="text-slate-500 text-sm hidden sm:inline-block">
                          ({selectedUser.niy || "-"})
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Ketik nama atau NIY pegawai...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[--radix-popover-trigger-width] p-1.5 rounded-2xl border-slate-700/60 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-black/60">
                  <Command
                    shouldFilter={false}
                    className="bg-transparent text-slate-200"
                  >
                    <CommandInput
                      placeholder="Ketik untuk mencari..."
                      value={search}
                      onValueChange={handleSearchChange}
                      className="border-none bg-transparent h-10 px-2 text-slate-200 placeholder:text-slate-500 focus:ring-0"
                    />

                    {pagedUsers.length === 0 ? (
                      <CommandEmpty className="text-slate-500 py-6 text-center text-sm">
                        Pegawai tidak ditemukan.
                      </CommandEmpty>
                    ) : (
                      <CommandGroup className="max-h-64 overflow-y-auto mt-2 space-y-1">
                        {pagedUsers.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.name} ${u.niy}`}
                            onSelect={() => handleSelectUser(u.id)}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
                          >
                            <div
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                                selectedUser?.id === u.id
                                  ? "border-indigo-500 bg-indigo-500/20"
                                  : "border-slate-700 bg-transparent",
                              )}
                            >
                              <Check
                                className={cn(
                                  "h-3 w-3 text-indigo-400 transition-opacity",
                                  selectedUser?.id === u.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{u.name}</span>
                              <span className="text-xs text-slate-500">
                                {u.niy}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between p-2 mt-2 border-t border-slate-800/50">
                        <Button
                          variant="ghost"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className="h-8 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <span className="text-xs font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full">
                          {page} / {totalPages}
                        </span>
                        <Button
                          variant="ghost"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages}
                          className="h-8 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tombol Ajukan */}
            {selectedUser && !showForm && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
                <Button
                  onClick={handleAjukan}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 border-t border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-base font-medium"
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Lanjutkan Pengajuan Cuti
                </Button>
              </div>
            )}

            {/* Area Form Cuti */}
            {showForm && selectedUser && userDetail && (
              <div className="animate-in fade-in slide-in-from-top-6 duration-700 ease-out">
                <div className="relative py-8">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-slate-700/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-900 px-4 text-xs font-medium text-slate-500 uppercase tracking-widest rounded-full border border-slate-700/60">
                      Lengkapi Data
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/40 rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                      <User className="h-7 w-7 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-white">
                        {selectedUser.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-0.5">
                        NIY: {selectedUser.niy || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Komponen LeaveForm yang sudah kita refactor di tahap sebelumnya */}
                  <LeaveForm
                    userId={selectedUser.id}
                    user={{ sisaCuti: userDetail.sisaCuti ?? 0 }}
                    onSuccess={() => router.push("/admin/dashboard")}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
