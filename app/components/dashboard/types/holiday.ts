export interface Holiday {
  id: string;
  date: string;
  description: string;
  users: { id: string; name: string; niy: string }[];
}

export interface UserOption {
  id: string;
  name: string;
  niy: string;
  divisi?: { name: string };
}
