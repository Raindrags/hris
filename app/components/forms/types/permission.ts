export interface SubstituteUser {
  id: string;
  name: string;
  divisi?: { id: string; name: string } | null;
}

export type PermissionUserData = {
  name: string;
  divisi?: {
    id?: string;
    name: string;
  } | null;
  [key: string]: unknown;
};

export type PermissionSubmitPayload = {
  startDate: string;
  endDate: string;
  reason: string;
  category: string;
  subCategory: string | null;
  time: string | null;
  file?: File | null;
  delegatedToId?: string | null;
  taskDetail?: string | null;
};
