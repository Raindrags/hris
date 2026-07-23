export interface SelectUser {
  id: string;
  name: string;
  divisi?: string | { name: string; [key: string]: any };
}

export interface NoFpAdminPayload {
  userId: string;
  date: string; // Format: YYYY-MM-DD
  fpDatang: boolean;
  fpPulang: boolean;
  reason: string;
  file?: File | null;
}
