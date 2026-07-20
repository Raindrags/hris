export interface SpecialWorkDate {
  id: string;
  startDate: string;
  endDate: string;
  description?: string;
  name?: string;
  checkIn?: string;
  checkOut?: string;
  users: { id: string; name: string; niy: string }[];
}

export interface UserOption {
  id: string;
  name: string;
  niy: string;
  divisi?: { name: string };
}
