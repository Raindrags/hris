"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  X,
  Save,
  Trash2,
  Pencil,
  Users,
  Search,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Import Server Actions
import {
  getAllShifts,
  createShift,
  updateShift,
  deleteShift,
  getEmployeesForAssign,
  batchAssignShift,
} from "@/app/actions/jadwal-action";
import { HolidayManager } from "@/app/components/dashboard/holiday-manager";
import { SpecialWorkDateManager } from "@/app/components/dashboard/special-workdate-manager";

// Konstanta Hari
const DAYS = [
  { id: 1, name: "Senin" },
  { id: 2, name: "Selasa" },
  { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" },
  { id: 5, name: "Jumat" },
  { id: 6, name: "Sabtu" },
  { id: 0, name: "Minggu" },
];

const generateDefaultDetails = () =>
  DAYS.map((d) => ({
    dayOfWeek: d.id,
    dayName: d.name,
    isActive: d.id >= 1 && d.id <= 5, // Senin-Jumat aktif
    checkIn: "07:30",
    checkOut: "16:00",
  }));

export default function PengaturanJadwalView() {
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // STATE: TEMPLATE SHIFT
  // ==========================================
  const [shifts, setShifts] = useState<any[]>([]);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    name: "",
    isFlexible: false,
    details: generateDefaultDetails(),
  });

  // State Paginasi untuk Tabel Shift Utama
  const [shiftCurrentPage, setShiftCurrentPage] = useState(1);
  const shiftsPerPage = 10;

  // ==========================================
  // STATE: BATCH ASSIGN MODAL
  // ==========================================
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] =
    useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Filter & Pagination Modal Pegawai
  const [searchTerm, setSearchTerm] = useState("");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await getAllShifts();

    if (res.success) {
      setShifts(res.data || []);
      setShiftCurrentPage(1);
    } else {
      toast.error(res.error || "Gagal memuat jadwal");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // PAGINASI TABEL SHIFT UTAMA
  // ==========================================
  const totalShiftPages = Math.ceil(shifts.length / shiftsPerPage);

  const paginatedShifts = useMemo(() => {
    const start = (shiftCurrentPage - 1) * shiftsPerPage;
    return shifts.slice(start, start + shiftsPerPage);
  }, [shifts, shiftCurrentPage, shiftsPerPage]);

  // ==========================================
  // HANDLERS UNTUK TEMPLATE SHIFT
  // ==========================================
  const handleSaveShift = async () => {
    if (!shiftForm.name.trim()) return toast.error("Nama template wajib diisi");

    setIsLoading(true);
    let res;
    if (editingShiftId) {
      res = await updateShift(editingShiftId, shiftForm);
    } else {
      res = await createShift(shiftForm);
    }

    if (res?.success) {
      toast.success(editingShiftId ? "Template diupdate!" : "Template dibuat!");
      setShowShiftForm(false);
      fetchData();
    } else {
      toast.error(res?.error || "Terjadi kesalahan saat menyimpan template");
    }
    setIsLoading(false);
  };

  const handleEditShift = (shift: any) => {
    const detailsForm = DAYS.map((d) => {
      const existing = shift.details?.find((sd: any) => sd.dayOfWeek === d.id);
      return {
        dayOfWeek: d.id,
        dayName: d.name,
        isActive: !!existing,
        checkIn: existing ? existing.checkIn : "07:30",
        checkOut: existing ? existing.checkOut : "16:00",
      };
    });

    setShiftForm({
      name: shift.name,
      isFlexible: shift.isFlexible,
      details: detailsForm,
    });
    setEditingShiftId(shift.id);
    setShowShiftForm(true);
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm("Yakin ingin menghapus template ini?")) return;
    setIsLoading(true);

    const res = await deleteShift(id);
    if (res?.success) {
      toast.success("Template berhasil dihapus");
      fetchData();
    } else {
      toast.error(res?.error || "Gagal menghapus template");
    }
    setIsLoading(false);
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    setShiftForm((prev) => {
      const newDetails = [...prev.details];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return { ...prev, details: newDetails };
    });
  };

  // ==========================================
  // HANDLERS UNTUK BATCH ASSIGN
  // ==========================================
  const openBatchAssignModal = async (shift: any) => {
    setSearchTerm("");
    setDivisiFilter("all");
    setCurrentPage(1);
    setSelectedShiftForAssign(shift);

    const res = await getEmployeesForAssign();
    if (res.success) {
      setEmployees(res.data || []);
      setDivisions(res.divisions || []);

      const alreadyAssigned = (res.data || [])
        .filter((e: any) => e.workShiftId === shift.id)
        .map((e: any) => e.id);
      setSelectedUserIds(alreadyAssigned);
      setIsAssignModalOpen(true);
    } else {
      toast.error(res.error || "Gagal memuat data pegawai");
    }
  };

  const handleSaveBatchAssign = async () => {
    if (!selectedShiftForAssign) return;

    const res = await batchAssignShift(
      selectedUserIds,
      selectedShiftForAssign.id,
    );

    if (res?.success) {
      toast.success(
        `Berhasil menugaskan jadwal ke ${selectedUserIds.length} pegawai`,
      );
      setIsAssignModalOpen(false);
    } else {
      toast.error(res.error || "Gagal menyimpan penugasan jadwal");
    }
  };

  const handleToggleEmployee = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // ==========================================
  // FILTER & PAGINASI PEGAWAI (MODAL)
  // ==========================================
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.niy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jabatan?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDivisi =
        divisiFilter === "all" || emp.divisi?.id === divisiFilter;

      return matchesSearch && matchesDivisi;
    });
  }, [employees, searchTerm, divisiFilter]);

  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, divisiFilter]);

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="space-y-6 text-gray-100">
      <Tabs defaultValue="shift">
        <TabsList className="flex-wrap bg-gray-900 border border-gray-800 p-1 rounded-lg">
          <TabsTrigger
            value="shift"
            className="data-[state=active]:bg-crimson-700 data-[state=active]:text-white text-gray-400"
          >
            Template Shift
          </TabsTrigger>
          <TabsTrigger
            value="holiday"
            className="data-[state=active]:bg-crimson-700 data-[state=active]:text-white text-gray-400"
          >
            Hari Libur
          </TabsTrigger>
          <TabsTrigger
            value="special"
            className="data-[state=active]:bg-crimson-700 data-[state=active]:text-white text-gray-400"
          >
            Hari Kerja Khusus
          </TabsTrigger>
        </TabsList>

        {/* ========== TAB TEMPLATE SHIFT ========== */}
        <TabsContent value="shift">
          <Card className="bg-gray-900 border-gray-800 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <CardTitle className="text-white">
                  Template Shift Kerja (Dinamis)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Atur jam masuk & pulang per hari dalam satu template jadwal.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setShowShiftForm(!showShiftForm);
                  if (!showShiftForm) {
                    setEditingShiftId(null);
                    setShiftForm({
                      name: "",
                      isFlexible: false,
                      details: generateDefaultDetails(),
                    });
                  }
                }}
                className="bg-crimson-700 hover:bg-crimson-800 text-white"
              >
                {showShiftForm ? (
                  <>
                    <X className="w-4 h-4 mr-2" /> Batal
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Template
                  </>
                )}
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              {showShiftForm && (
                <div className="bg-gray-800/50 p-6 rounded-lg mb-6 border border-gray-700 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Nama Template Jadwal
                      </Label>
                      <Input
                        placeholder="Contoh: Guru Reguler, Satpam Pagi"
                        value={shiftForm.name}
                        onChange={(e) =>
                          setShiftForm({ ...shiftForm, name: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end pb-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="flexible"
                          checked={shiftForm.isFlexible}
                          onCheckedChange={(c) =>
                            setShiftForm({ ...shiftForm, isFlexible: !!c })
                          }
                        />
                        <Label
                          htmlFor="flexible"
                          className="text-gray-300 cursor-pointer"
                        >
                          Jadwal Flexible (Bebas jam masuk, hanya hitung total
                          jam)
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-white">
                      Pengaturan Jam per Hari
                    </Label>
                    <div className="border border-gray-700 rounded-md divide-y divide-gray-700 overflow-hidden">
                      {shiftForm.details.map((day, index) => (
                        <div
                          key={day.dayOfWeek}
                          className={`flex items-center gap-4 p-3 transition-colors ${
                            day.isActive ? "bg-gray-800" : "bg-gray-900/50"
                          }`}
                        >
                          <div className="w-32 flex items-center gap-2">
                            <Checkbox
                              checked={day.isActive}
                              onCheckedChange={(c) =>
                                handleDetailChange(index, "isActive", !!c)
                              }
                            />
                            <Label
                              className={
                                day.isActive
                                  ? "font-medium text-gray-200"
                                  : "text-gray-500 cursor-pointer"
                              }
                            >
                              {day.dayName}
                            </Label>
                          </div>

                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-gray-400 w-12">
                                Masuk
                              </Label>
                              <Input
                                type="time"
                                value={day.checkIn}
                                disabled={!day.isActive}
                                className={
                                  !day.isActive
                                    ? "opacity-50"
                                    : "bg-gray-800 border-gray-700 text-gray-100"
                                }
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "checkIn",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-gray-400 w-16">
                                Pulang
                              </Label>
                              <Input
                                type="time"
                                value={day.checkOut}
                                disabled={!day.isActive}
                                className={
                                  !day.isActive
                                    ? "opacity-50"
                                    : "bg-gray-800 border-gray-700 text-gray-100"
                                }
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "checkOut",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveShift}
                      disabled={isLoading}
                      className="bg-crimson-700 hover:bg-crimson-800 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingShiftId ? "Update Template" : "Simpan Template"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="border border-gray-800 rounded-md">
                <Table>
                  <TableHeader className="bg-gray-800/50">
                    <TableRow>
                      <TableHead className="text-gray-300">
                        Nama Template
                      </TableHead>
                      <TableHead className="text-gray-300">
                        Hari Kerja (Aktif)
                      </TableHead>
                      <TableHead className="text-gray-300">Tipe</TableHead>
                      <TableHead className="text-right text-gray-300">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && shifts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-6 text-gray-500"
                        >
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : shifts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-6 text-gray-500"
                        >
                          Belum ada template jadwal.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedShifts.map((s) => {
                        const activeDays = s.details
                          ?.map((d: any) => {
                            const dayObj = DAYS.find(
                              (day) => day.id === d.dayOfWeek,
                            );
                            return dayObj ? dayObj.name.substring(0, 3) : "";
                          })
                          .join(", ");

                        return (
                          <TableRow key={s.id} className="border-gray-800">
                            <TableCell className="font-medium text-white">
                              {s.name}
                            </TableCell>
                            <TableCell className="text-sm text-gray-400">
                              {s.details?.length || 0} Hari ({activeDays || "-"}
                              )
                            </TableCell>
                            <TableCell>
                              {s.isFlexible ? (
                                <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full font-medium">
                                  Flexible
                                </span>
                              ) : (
                                <span className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded-full font-medium">
                                  Reguler
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-800 bg-blue-900/20 text-blue-300 hover:bg-blue-900/40 mr-2"
                                onClick={() => openBatchAssignModal(s)}
                              >
                                <Users className="w-4 h-4 mr-2" /> Assign
                                Pegawai
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditShift(s)}
                              >
                                <Pencil className="w-4 h-4 text-amber-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteShift(s.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {totalShiftPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border-t border-gray-800">
                    <span className="text-sm text-gray-400">
                      Menampilkan {paginatedShifts.length} dari {shifts.length}{" "}
                      template
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShiftCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={shiftCurrentPage === 1}
                        className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                      </Button>
                      <span className="text-sm font-medium px-2 text-gray-300">
                        Hal {shiftCurrentPage} / {totalShiftPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShiftCurrentPage((p) =>
                            Math.min(totalShiftPages, p + 1),
                          )
                        }
                        disabled={shiftCurrentPage === totalShiftPages}
                        className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                      >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TAB HARI LIBUR ========== */}
        <TabsContent value="holiday">
          <Card className="bg-gray-900 border-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">
                Hari Libur Nasional & Perusahaan
              </CardTitle>
              <CardDescription className="text-gray-400">
                Kelola tanggal libur yang berlaku. Kosongkan pegawai untuk
                berlaku ke semua.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HolidayManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TAB HARI KERJA KHUSUS ========== */}
        <TabsContent value="special">
          <Card className="bg-gray-900 border-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Hari Kerja Khusus</CardTitle>
              <CardDescription className="text-gray-400">
                Hari libur yang dijadikan hari kerja (misal: Sabtu/Minggu masuk
                karena event). Bisa ditentukan per pegawai atau divisi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpecialWorkDateManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========== MODAL BATCH ASSIGN ========== */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="!w-[60vw] !max-w-[95vw] max-h-[85vh] flex flex-col bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">
              Atur Pegawai untuk: {selectedShiftForAssign?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Pilih pegawai yang akan ditugaskan ke template jadwal ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari Nama, NIY, atau Jabatan..."
                className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-crimson-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={divisiFilter}
              onValueChange={(value) => setDivisiFilter(value ?? "all")}
            >
              <SelectTrigger className="w-full sm:w-[250px] bg-gray-800 border-gray-700 text-gray-200">
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col mt-4 border border-gray-800 rounded-md">
            <div className="overflow-y-auto flex-1">
              <Table>
                <TableHeader className="bg-gray-800/50 sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={
                          filteredEmployees.length > 0 &&
                          filteredEmployees.every((emp) =>
                            selectedUserIds.includes(emp.id),
                          )
                        }
                        onCheckedChange={(checked) => {
                          const filteredIds = filteredEmployees.map(
                            (e) => e.id,
                          );
                          if (checked) {
                            setSelectedUserIds((prev) =>
                              Array.from(new Set([...prev, ...filteredIds])),
                            );
                          } else {
                            setSelectedUserIds((prev) =>
                              prev.filter((id) => !filteredIds.includes(id)),
                            );
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-gray-300">
                      Nama Pegawai
                    </TableHead>
                    <TableHead className="text-gray-300">NIY</TableHead>
                    <TableHead className="text-gray-300">Jabatan</TableHead>
                    <TableHead className="text-gray-300">Divisi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        Tidak ada pegawai yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEmployees.map((emp) => (
                      <TableRow
                        key={emp.id}
                        className="cursor-pointer hover:bg-gray-800/50 transition-colors border-gray-800"
                        onClick={() => handleToggleEmployee(emp.id)}
                      >
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedUserIds.includes(emp.id)}
                            onCheckedChange={() => handleToggleEmployee(emp.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {emp.name}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {emp.niy || "-"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {emp.jabatan || emp.role || "-"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {emp.divisi?.name || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalEmployeePages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-800">
                <span className="text-sm text-gray-400">
                  Menampilkan {paginatedEmployees.length} dari{" "}
                  {filteredEmployees.length} pegawai
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <span className="text-sm font-medium px-2 text-gray-300">
                    Hal {currentPage} / {totalEmployeePages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalEmployeePages, p + 1))
                    }
                    disabled={currentPage === totalEmployeePages}
                    className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-gray-800 pt-4 mt-2">
            <span className="text-sm font-medium mr-auto text-blue-400 mt-2">
              Total Dipilih: {selectedUserIds.length} Pegawai
            </span>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveBatchAssign}
              className="bg-crimson-700 hover:bg-crimson-800 text-white"
            >
              Simpan Penugasan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
