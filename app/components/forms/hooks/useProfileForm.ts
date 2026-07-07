import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { UserProfileData } from "../types/profile";

export const useProfileForm = (user: UserProfileData) => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [loading, setLoading] = useState<boolean>(false);
  const isFirstTime = user?.isFirstLogin === true;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        emergencyContact: formData.get("emergencyContact") as string,
        address: formData.get("address") as string,
        isFirstLogin: false,
      };

      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Profil berhasil diperbarui");

        setTimeout(() => {
          if (callbackUrl) {
            window.location.href = callbackUrl;
          } else {
            window.location.href = "/pegawai/dashboard";
          }
        }, 1000);
      } else {
        // Ambil pesan error jika ada, dibungkus catch agar tidak crash
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Gagal memperbarui profil");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan sistem saat menyimpan profil.");
      setLoading(false);
    }
  };

  return {
    loading,
    isFirstTime,
    handleSubmit,
  };
};
