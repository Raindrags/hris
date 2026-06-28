export const API_ROUTES = {
  AUTH_ME: "/api/auth/me",
};

export const APP_ROUTES = {
  LOGIN_WHATSAPP: "/login?message=silakan_login_via_whatsapp",
  FORM_IZIN: "/pegawai/form-izin",
  FORM_CUTI: "/pegawai/form-cuti",
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};
