export interface SubstituteUser {
  id: string;
  name: string;
  divisiId?: string | number | null;
  divisi?: { id?: string | number; name?: string } | string | null;
}

export type PermissionUserData = {
  id: string;
  name: string;
  divisiId?: string | number | null;
  divisi?: { id?: string | number; name?: string } | string | null;
};

export interface PermissionSubmitPayload {
  startDate: string;
  endDate: string;
  reason: string;
  category: string;
  subCategory?: string | null;
  time?: string | null;
  returnTime?: string | null;      
  attachmentLink?: string | null;  
  file?: File | null;
  delegatedToId?: string | null;
  taskDetail?: string | null;
}
