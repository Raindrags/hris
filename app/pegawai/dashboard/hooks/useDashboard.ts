import { useEffect, useState, useCallback } from "react";
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
  DeductionSummary, // 1. Tambahkan import ini
} from "../types";

export const useDashboard = () => {
  const router = useRouter();
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // 2. Tambahkan state untuk deductionSummary
  const [deductionSummary, setDeductionSummary] =
    useState<DeductionSummary | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardData();
      if (!data.success) {
        setUserData(null);
        return;
      }
      setUserData(data.user || null);
      setRecentRequests(data.recentRequests || []);
      setIncomingRequests(data.incomingRequests || []);
      setPotentialSubstitutes(data.potentialSubstitutes || []);
      setAttendanceSummary(data.attendanceSummary || null);

      // 3. Set data deductionSummary dari response API
      setDeductionSummary(data.deductionSummary || null);
    } catch (error) {
      console.error("Refresh dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(API_ROUTES.AUTH_ME);
        if (res.status === 401) {
          router.push(APP_ROUTES.LOGIN_WHATSAPP);
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (error) {
        console.error("Auth check error:", error);
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
