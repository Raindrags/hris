"use client";

import { Suspense, useState } from "react";
// PENTING: Tambahkan kembali useSearchParams
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

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

interface ProfileFormProps {
  user: UserProfileData;
  variant?: "page" | "onboarding";
}

// Komponen dalam
function ProfileFormContent({ user, variant = "page" }: ProfileFormProps) {
  const router = useRouter();
  // Membaca target url awal (contoh: /pegawai/form-cuti)
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [loading, setLoading] = useState<boolean>(false);

  const isFirstTime = user?.isFirstLogin === true;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Profil berhasil diperbarui");

        // --- UBAH BAGIAN INI ---
        // Kita gunakan window.location.href untuk memaksa browser memuat
        // ulang halaman sepenuhnya agar tidak memakai Cache / Ingatan lama.

        setTimeout(() => {
          if (callbackUrl) {
            window.location.href = callbackUrl;
          } else {
            window.location.href = "/pegawai/dashboard";
          }
        }, 1000); // Beri jeda 1 detik agar pesan toast "Berhasil" sempat terbaca
        // ------------------------
      } else {
        toast.error(data.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan sistem saat menyimpan profil.");
    } finally {
      setLoading(false);
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Nama Lengkap</Label>
          <Input value={user?.name ?? ""} disabled className="bg-muted/50" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Email (Login)</Label>
          <Input name="email" defaultValue={user?.email ?? ""} />
        </div>

        <div className="space-y-2">
          <Label>Nomor HP / WhatsApp</Label>
          <Input
            name="phone"
            defaultValue={user?.phone ?? ""}
            placeholder="0812xxxx"
          />
        </div>
        <div className="space-y-2">
          <Label>Kontak Darurat (Nama & HP)</Label>
          <Input
            name="emergencyContact"
            defaultValue={user?.emergencyContact ?? ""}
            placeholder="Istri - 0812xxxx"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alamat Domisili</Label>
        <Textarea
          name="address"
          defaultValue={user?.address ?? ""}
          placeholder="Masukkan alamat lengkap..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isFirstTime ? "Simpan & Lanjutkan" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );

  if (variant === "onboarding") {
    return <div className="py-2">{FormContent}</div>;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>
              {isFirstTime
                ? "Lengkapi data diri dan kontak Anda sebelum menggunakan aplikasi."
                : "Data diri dan kontak yang dapat dihubungi."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{FormContent}</CardContent>
    </Card>
  );
}

// Komponen utama dengan Suspense
export function ProfileForm(props: ProfileFormProps) {
  return (
    <Suspense fallback={<div className="py-4 text-center">Memuat form...</div>}>
      <ProfileFormContent {...props} />
    </Suspense>
  );
}
