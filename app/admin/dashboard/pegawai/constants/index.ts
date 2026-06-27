import { EmployeeFormData } from "../types";

export const INITIAL_FORM_STATE: EmployeeFormData = {
  name: "",
  email: "",
  role: "USER",
  supervisorId: "none",
  divisiId: "none",
  niy: "",
  phone: "",
  emergencyContact: "",
  jabatan: "",
  jatahCuti: "",
};

export const ITEMS_PER_PAGE = 5;
