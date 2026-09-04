import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
// Pastikan EmployeeFormData di "../types" memiliki properti sortOrder?: string | number
import { Employee, Supervisor, Division, EmployeeFormData } from "../types";
import { INITIAL_FORM_STATE, ITEMS_PER_PAGE } from "../constants";

// Helper internal untuk memparsing response dinamis
const extractArray = <T>(responseData: unknown): T[] => {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData as T[];

  const resObj = responseData as Record<string, unknown>;

  if (
    resObj.data &&
    (resObj.data as Record<string, unknown>).data &&
    Array.isArray((resObj.data as Record<string, unknown>).data)
  ) {
    return (resObj.data as Record<string, unknown>).data as T[];
  }
  if (resObj.data && Array.isArray(resObj.data)) {
    return resObj.data as T[];
  }
  if (typeof responseData === "object") {
    const arrayInsideObject = Object.values(resObj).find((val) =>
      Array.isArray(val),
    );
    if (arrayInsideObject) {
      return arrayInsideObject as T[];
    }
  }
  return [];
};

export const useEmployees = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<EmployeeFormData>(INITIAL_FORM_STATE);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, supRes, divRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/users/supervisors"),
        fetch("/api/division"),
      ]);

      const empData = await empRes.json();
      const supData = await supRes.json();
      const divData = await divRes.json();

      if (empRes.ok) setEmployees(extractArray<Employee>(empData));
      else toast.error("Gagal memuat data pegawai");

      if (supRes.ok) setSupervisors(extractArray<Supervisor>(supData));
      if (divRes.ok) setDivisions(extractArray<Division>(divData));
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM_STATE,
      sortOrder: "999",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name || employee.fullName || "",
      email: employee.email || "",
      role: employee.role || "USER",
      supervisorId: String(
        employee.supervisorId || employee.supervisor?.id || "none",
      ),
      divisiId: String(employee.divisiId || employee.divisi?.id || "none"),
      niy: employee.niy || "",
      phone: employee.phone || "",
      emergencyContact: employee.emergencyContact || "",
      jabatan: employee.jabatan || "",
      jatahCuti: String(employee.jatahCuti || ""),
      sortOrder:
        employee.sortOrder !== null && employee.sortOrder !== undefined
          ? String(employee.sortOrder)
          : "999",
      joinDate: employee.joinDate
        ? new Date(employee.joinDate).toISOString().split("T")[0]
        : "",
      isGuru: employee.isGuru || false,
      jatahCuti: String(employee.jatahCuti || ""),
      jatahIzinKeluar: String(employee.jatahIzinKeluar || "6"),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus pegawai ${name}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Pegawai berhasil dihapus");
        fetchData();
      } else {
        toast.error(data.message || data.error || "Gagal menghapus pegawai");
      }
    } catch (error) {
      toast.error("Gagal menghapus pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Nama dan Email wajib diisi");
      return;
    }

    setIsSaving(true);
    const payload = {
      ...formData,
      supervisorId:
        formData.supervisorId === "none" ? null : formData.supervisorId,
      divisiId: formData.divisiId === "none" ? null : formData.divisiId,
      // Pastikan string angka diparsing menjadi number
      sortOrder: formData.sortOrder ? Number(formData.sortOrder) : 999,
      jatahIzinKeluar: formData.jatahIzinKeluar
        ? Number(formData.jatahIzinKeluar)
        : 6,
    };

    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          editingId
            ? "Data pegawai diupdate!"
            : "Pegawai baru berhasil ditambahkan!",
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || data.error || "Terjadi kesalahan sistem");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return employees;

    return employees.filter((emp) => {
      // 1. Ambil data NIY
      const empNiy = (emp.niy || "").toLowerCase();

      // 2. Ambil data Nama (mendukung properti name atau fullName)
      const empName = (emp.name || emp.fullName || "").toLowerCase();

      const divId = String(emp.divisiId || emp.divisi?.id);
      const division = divisions.find((d) => String(d.id) === divId);
      const divName = (division?.name || emp.divisi?.name || "").toLowerCase();

      // Return true jika searchTerm cocok dengan salah satu dari ketiga field tersebut
      return (
        empNiy.includes(searchLower) ||
        empName.includes(searchLower) ||
        divName.includes(searchLower)
      );
    });
  }, [employees, searchTerm, divisions]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const getSupervisorName = (employee: Employee) => {
    const supId = String(employee.supervisorId || employee.supervisor?.id);
    if (!supId || supId === "undefined") return "-";
    const supervisor = employees.find((emp) => String(emp.id) === supId);
    return supervisor ? supervisor.name || supervisor.fullName : "-";
  };

  const hideJatahCuti = /guru|kepala sekolah|wakil kepala sekolah/i.test(
    formData.jabatan,
  );

  return {
    state: {
      isLoading,
      isSaving,
      employees,
      supervisors,
      divisions,
      isModalOpen,
      editingId,
      formData,
      searchTerm,
      currentPage,
      filteredEmployees,
      paginatedEmployees,
      totalPages,
      hideJatahCuti,
    },
    actions: {
      setIsModalOpen,
      setFormData,
      setSearchTerm,
      setCurrentPage,
      openCreateModal,
      openEditModal,
      handleDelete,
      handleSave,
      getSupervisorName,
    },
  };
};
