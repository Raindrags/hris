export interface Holiday {
  id: string;
  date?: string;
  startDate: string;
  endDate: string;
  description: string;
  users: { id: string; name: string; niy: string }[];
}

export interface UserOption {
  id: string;
  name: string;
  niy?: string | null;
  jabatan?: string | null;
  divisi?: {
    id: string;
    name: string;
  } | null;
}
