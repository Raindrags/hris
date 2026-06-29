export interface AttendancePeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
}

export type PeriodActionType = "active" | "close";

export interface PeriodFormData {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}