"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  Check,
  ChevronsUpDown,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionForm } from "@/app/components/forms/izin-form";

const ITEMS_PER_PAGE = 10;

export default function AdminFormIzinPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);

  // Pencarian & pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.success && data.data) setUsers(data.data);
      } catch (error) {
        console.error("Gagal mengambil daftar pegawai", error);
      }
    };
    fetchUsers();
  }, []);

  // Debounce pencarian
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  // Filter data
  const filteredUsers = debouncedSearch
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.niy?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : users;

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const pagedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSelectUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    setOpen(false);
    setShowForm(false);

    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      setUserDetail(data.data || data.user || {});
    } catch {
      setUserDetail({});
    }
  };

  const handleAjukan = () => setShowForm(true);

  return (
    <div className="min-h-screen bg-gray-950 p-6 max-w-2xl mx-auto space-y-6 text-gray-100">
      <Card className="bg-gray-900 border-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-crimson-500" />
            Pengajuan Izin untuk Pegawai
          </CardTitle>
          <CardDescription className="text-gray-400">
            Pilih pegawai yang akan diajukan izin, lalu klik tombol Ajukan untuk
            mengisi form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Cari Pegawai</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                >
                  {selectedUser ? (
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {selectedUser.name} ({selectedUser.niy || "-"})
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      Ketik nama atau NIY pegawai…
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-gray-700 bg-gray-900 shadow-xl">
                <Command
                  shouldFilter={false}
                  className="bg-transparent text-gray-200"
                >
                  <CommandInput
                    placeholder="Cari pegawai..."
                    value={search}
                    onValueChange={handleSearchChange}
                    className="border-gray-700 bg-gray-800 text-gray-200 placeholder:text-gray-500"
                  />
                  <CommandEmpty className="text-gray-500">
                    Tidak ditemukan.
                  </CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {pagedUsers.map((u) => (
                      <CommandItem
                        key={u.id}
                        value={`${u.name} ${u.niy}`}
                        onSelect={() => handleSelectUser(u.id)}
                        className="text-gray-200 hover:bg-gray-800 hover:text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-crimson-500",
                            selectedUser?.id === u.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {u.name} ({u.niy})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-1.5 border-t border-gray-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-gray-400">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedUser && !showForm && (
            <Button
              onClick={handleAjukan}
              className="w-full bg-crimson-700 hover:bg-crimson-800 text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Ajukan Izin untuk {selectedUser.name}
            </Button>
          )}

          {showForm && selectedUser && userDetail && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold text-lg mb-4 text-white">
                Form Izin – {selectedUser.name}
              </h3>
              <PermissionForm
                userId={selectedUser.id}
                user={{
                  name: userDetail.name || selectedUser.name,
                  divisi: userDetail.divisi || null,
                }}
                onSuccess={() => router.push("/admin/dashboard")}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
