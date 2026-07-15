import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AdminUser, AdminUserDetail } from "../types";

const ITEMS_PER_PAGE = 10;

export const useAdminLeaveForm = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Fetch Users dengan Smart Extractor & Anti-Cache
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const responseData = await res.json();

        let extractedUsers: AdminUser[] = [];

        if (Array.isArray(responseData)) {
          extractedUsers = responseData;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          extractedUsers = responseData.data;
        } else if (
          responseData?.data?.data &&
          Array.isArray(responseData.data.data)
        ) {
          extractedUsers = responseData.data.data;
        } else if (responseData?.users && Array.isArray(responseData.users)) {
          extractedUsers = responseData.users;
        }

        setUsers(extractedUsers.length > 0 ? extractedUsers : []);
      } catch (error) {
        console.log(
          "Menggunakan data simulasi untuk keperluan preview karena fetch API lokal tidak tersedia.",
        );
      }
    };
    fetchUsers();
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const { pagedUsers, totalPages } = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];

    const filteredUsers = debouncedSearch
      ? safeUsers.filter(
          (u) =>
            u?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            u?.niy?.toLowerCase().includes(debouncedSearch.toLowerCase()),
        )
      : safeUsers;

    const finalUsers = Array.isArray(filteredUsers) ? filteredUsers : [];
    const calculatedTotalPages =
      Math.ceil(finalUsers.length / ITEMS_PER_PAGE) || 1;
    const calculatedPagedUsers = finalUsers.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE,
    );

    return {
      pagedUsers: calculatedPagedUsers,
      totalPages: calculatedTotalPages,
    };
  }, [users, debouncedSearch, page]);

  // 4. Handlers
  const handleSelectUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId) || null;
    setSelectedUser(user);
    setOpen(false);
    setShowForm(false);

    if (!user) return;

    try {
      // ANTI-CACHE DITAMBAHKAN DI SINI JUGA
      const res = await fetch(`/api/users/${userId}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();

      const detailObj = data.data || data.user || {};
      setUserDetail({
        ...detailObj,
        sisaCuti: detailObj.sisaCuti ?? user?.sisaCuti ?? 0,
      });
    } catch {
      setUserDetail({ sisaCuti: user?.sisaCuti ?? 0 });
    }
  };

  const handleAjukan = () => setShowForm(true);

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  return {
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
  };
};
