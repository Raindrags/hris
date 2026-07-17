import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData } from "@/app/actions/dashboard-action";
import { API_ROUTES, APP_ROUTES } from "../constants";
import {
  UserData,
  RecentRequest,
  ApprovalRequestData,
  SubstituteUser,
  AttendanceSummary,
  AuthUser,
  DeductionSummary,
} from "../types";

export const useDashboard = () => {
  const router = useRouter();

  // 1. Tambahkan ref untuk melacak apakah komponen masih aktif (mounted) di layar
  const isMounted = useRef(true);

  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<
    ApprovalRequestData[]
  >([]);
  const [potentialSubstitutes, setPotentialSubstitutes] = useState<
    SubstituteUser[]
  >([]);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary | null>(null);
  const [deductionSummary, setDeductionSummary] =
    useState<DeductionSummary | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Membersihkan status isMounted saat komponen tertutup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    try {
      const data = await getDashboardData();

      // Pastikan komponen belum di-unmount selama menunggu fetch selesai
      if (!isMounted.current) return;

      if (!data.success) {
        // 2. Reset SEMUA state agar data sisa tidak "nyangkut" di UI
        setUserData(null);
        setRecentRequests([]);
        setIncomingRequests([]);
        setPotentialSubstitutes([]);
        setAttendanceSummary(null);
        setDeductionSummary(null);
        return;
      }

      setUserData(data.user || null);
      setRecentRequests(data.recentRequests || []);
      setIncomingRequests(data.incomingRequests || []);
      setPotentialSubstitutes(data.potentialSubstitutes || []);
      setAttendanceSummary(data.attendanceSummary || null);
      setDeductionSummary(data.deductionSummary || null);
    } catch (error) {
      console.error("Refresh dashboard error:", error);
    } finally {
      // 3. Pastikan tidak mengubah loading di komponen yang sudah unmount
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(API_ROUTES.AUTH_ME);
        if (res.status === 401) {
          if (isMounted.current) setLoading(false);
          router.push(APP_ROUTES.LOGIN_WHATSAPP);
          return;
        }

        const data = await res.json();
        if (isMounted.current) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted.current) setLoading(false);
        router.push(APP_ROUTES.LOGIN_WHATSAPP);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;
    refreshData();
  }, [currentUser, refreshData]);

  return {
    states: {
      loading,
      userData,
      recentRequests,
      incomingRequests,
      potentialSubstitutes,
      attendanceSummary,
      currentUser,
      deductionSummary,
    },
    actions: {
      refreshData,
    },
  };
};
