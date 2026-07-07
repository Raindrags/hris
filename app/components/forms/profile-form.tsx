"use client";

import { Suspense } from "react";
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
import { Loader2, Save } from "lucide-react";
import { ProfileFormProps } from "./types/profile";
import { useProfileForm } from "./hooks/useProfileForm";

function ProfileFormContent({ user, variant = "page" }: ProfileFormProps) {
  const { loading, isFirstTime, handleSubmit } = useProfileForm(user);
  const FormContent = (
    <form
      key={user?.id || "loading-form"}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
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

// Komponen utama dengan Suspense Wrapper
export function ProfileForm(props: ProfileFormProps) {
  return (
    <Suspense fallback={<div className="py-4 text-center">Memuat form...</div>}>
      <ProfileFormContent {...props} />
    </Suspense>
  );
}
