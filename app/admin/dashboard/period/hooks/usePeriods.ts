"use client";

import { useState, useEffect, useCallback } from "react";
import { AttendancePeriod, PeriodActionType, PeriodFormData } from "../types";
import { PERIODS_API_URL } from "../constants";

export function usePeriods() {
  const [periods, setPeriods] = useState<AttendancePeriod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State untuk Dialog Form Create
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<PeriodFormData>({
    name: "",
    startDate: undefined,
    endDate: undefined,
  });

  // State untuk Alert Konfirmasi
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<PeriodActionType | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(PERIODS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setPeriods(data);
      }
    } catch (error) {
      console.error("Gagal memuat data periode:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) return;

    setSubmitLoading(true);
    try {
      const res = await fetch(PERIODS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({ name: "", startDate: undefined, endDate: undefined });
        fetchPeriods();
      }
    } catch (error) {
      console.error("Gagal membuat periode:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const triggerActionConfirmation = (id: string, type: PeriodActionType) => {
    setSelectedPeriodId(id);
    setAlertType(type);
    setAlertOpen(true);
  };

  const executeAction = async () => {
    if (!selectedPeriodId || !alertType) return;

    const endpoint = `${PERIODS_API_URL}/${selectedPeriodId}/${alertType}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        fetchPeriods();
      }
    } catch (error) {
      console.error(`Gagal melakukan aksi ${alertType}:`, error);
    } finally {
      setAlertOpen(false);
      setSelectedPeriodId(null);
      setAlertType(null);
    }
  };

  return {
    states: {
      periods,
      loading,
      isDialogOpen,
      submitLoading,
      formData,
      alertOpen,
      alertType,
    },
    actions: {
      setIsDialogOpen,
      setFormData,
      handleCreatePeriod,
      setAlertOpen,
      triggerActionConfirmation,
      executeAction,
      setSelectedPeriodId,
    },
  };
}