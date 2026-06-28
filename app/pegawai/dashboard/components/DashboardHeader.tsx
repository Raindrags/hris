import Link from "next/link";
import { FileText, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "../constants";

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Halo, {userName}!</h1>
        <p className="text-gray-400 mt-1">
          Selamat datang di Dashboard Kepegawaian.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href={APP_ROUTES.FORM_IZIN}>
          <Button
            variant="outline"
            className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white"
          >
            <FileText className="h-4 w-4 mr-2" /> Izin
          </Button>
        </Link>
        <Link href={APP_ROUTES.FORM_CUTI}>
          <Button className="bg-crimson-700 hover:bg-crimson-800 text-white shadow-md shadow-crimson-900/30">
            <CalendarDays className="h-4 w-4 mr-2" /> Cuti
          </Button>
        </Link>
      </div>
    </div>
  );
};
