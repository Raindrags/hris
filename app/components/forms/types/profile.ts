export type UserProfileData = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
  isFirstLogin?: boolean | null;
  [key: string]: unknown;
};

export interface ProfileFormProps {
  user: UserProfileData;
  variant?: "page" | "onboarding";
}
