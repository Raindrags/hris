"use client";

import { Suspense, useState } from "react";
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
import { Loader2, Pencil, Save, X } from "lucide-react";

export type UserProfileData = {
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
  onSuccess?: () => void;
  variant?: "page" | "onboarding";
}

// Komponen dalam yang menggunakan useSearchParams
function ProfileFormContent({
  user,
  onSuccess,
  variant = "page",
}: ProfileFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [isEditingState, setIsEditingState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isFirstTime = user?.isFirstLogin === true;
  const isEditing = variant === "onboarding" || isFirstTime || isEditingState;

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
      };

      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Profil berhasil diperbarui");

        if (variant === "page" && !isFirstTime) {
          setIsEditingState(false);
        }

        if (onSuccess) {
          onSuccess();
        }

        if (isFirstTime && callbackUrl) {
          router.push(callbackUrl);
        } else if (isFirstTime) {
          router.refresh();
        }
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
          <Input
            name="email"
            defaultValue={user?.email ?? ""}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label>Nomor HP / WhatsApp</Label>
          <Input
            name="phone"
            defaultValue={user?.phone ?? ""}
            disabled={!isEditing}
            placeholder="0812xxxx"
          />
        </div>
        <div className="space-y-2">
          <Label>Kontak Darurat (Nama & HP)</Label>
          <Input
            name="emergencyContact"
            defaultValue={user?.emergencyContact ?? ""}
            disabled={!isEditing}
            placeholder="Istri - 0812xxxx"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alamat Domisili</Label>
        <Textarea
          name="address"
          defaultValue={user?.address ?? ""}
          disabled={!isEditing}
          placeholder="Masukkan alamat lengkap..."
          className="min-h-[100px]"
        />
      </div>

      {isEditing && (
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isFirstTime
              ? "Simpan & Lanjutkan"
              : variant === "onboarding"
                ? "Simpan & Lanjut"
                : "Simpan Perubahan"}
          </Button>
        </div>
      )}
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

          {!isFirstTime &&
            (!isEditingState ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingState(true)}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Data
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingState(false)}
              >
                <X className="w-4 h-4 mr-2" /> Batal
              </Button>
            ))}
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
