export interface AdminUser {
  id: string;
  name: string;
  niy?: string;
  sisaCuti?: number;
  [key: string]: unknown;
}

export interface AdminUserDetail {
  sisaCuti: number;
  [key: string]: unknown;
}
