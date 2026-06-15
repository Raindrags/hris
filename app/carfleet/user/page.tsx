import { Metadata } from "next";
import UserPortalView from "./components/UserPortalView";

export const metadata: Metadata = {
  title: "Portal Peminjaman Kendaraan | SekolahApp",
  description:
    "Sistem pengajuan sewa armada, ikut serta (nebeng), dan titip logistik menggunakan kendaraan sekolah.",
};

export default function UserPortalPage() {
  return <UserPortalView />;
}
