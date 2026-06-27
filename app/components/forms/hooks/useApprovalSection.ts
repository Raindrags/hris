// app/hooks/useApprovalSection.ts

import { useState, useCallback } from "react";
import { ApprovalRequestData } from "../types";

export const useApprovalSection = (onRefresh: () => void) => {
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequestData | null>(null);

  // Handler untuk mengontrol dialog/modal
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSelectedRequest(null);
        onRefresh();
      }
    },
    [onRefresh],
  );

  const openApprovalDialog = useCallback((req: ApprovalRequestData) => {
    setSelectedRequest(req);
  }, []);

  const closeApprovalDialog = useCallback(() => {
    setSelectedRequest(null);
    onRefresh();
  }, [onRefresh]);

  // Utility untuk merapikan format rentang tanggal
  const formatDateRange = (start: Date | string, end: Date | string) => {
    const startDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(new Date(start));

    const endDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(end));

    return `${startDate} - ${endDate}`;
  };

  return {
    selectedRequest,
    handleOpenChange,
    openApprovalDialog,
    closeApprovalDialog,
    formatDateRange,
  };
};
