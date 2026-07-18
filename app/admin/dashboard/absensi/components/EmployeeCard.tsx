import { User, Briefcase, Hash, Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeReport, AttendanceLog } from "../types";
import { SummaryBadge } from "./SummaryBadge";
import { StatusBadge } from "./StatusBadge";

interface EmployeeCardProps {
  emp: EmployeeReport;
}

export function EmployeeCard({ emp }: EmployeeCardProps) {
  return (
    <Card className="overflow-hidden shadow-md border-gray-800 bg-gray-900">
      <CardHeader className="bg-gray-800/50 border-b border-gray-800 pb-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <User className="w-5 h-5 text-crimson-400" />
              {emp.name}
              {emp.summary.hasViolation && (
                <span className="ml-2 inline-flex items-center gap-1 bg-red-900/30 text-red-300 text-xs font-bold px-2.5 py-1 rounded-full border border-red-800">
                  <AlertCircle className="w-3.5 h-3.5" /> Pelanggaran SP
                </span>
              )}
            </CardTitle>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mt-2">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> NIY: {emp.niy || "-"}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {emp.jabatan || "-"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Shift: {emp.shiftName}
              </span>
            </div>
          </div>

          <div className="flex gap-2 text-xs md:text-sm">
            <SummaryBadge
              color="emerald"
              value={emp.summary.onTime}
              label="Tepat"
            />
            <SummaryBadge
              color="amber"
              value={emp.summary.late}
              label="Telat"
            />
            <SummaryBadge
              color="red"
              value={emp.summary.alpa ?? emp.summary.noFp ?? 0}
              label="Alpa"
            />
            <SummaryBadge
              color="gray"
              value={emp.summary.off ?? 0}
              label="Off"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-800/50">
            <TableRow className="border-b border-gray-800">
              <TableHead className="w-[120px] pl-6 text-gray-300">
                Tanggal
              </TableHead>
              <TableHead className="text-gray-300">Hari</TableHead>
              <TableHead className="text-center text-gray-300">
                Jam Masuk
              </TableHead>
              <TableHead className="text-center text-gray-300">
                Jam Pulang
              </TableHead>
              <TableHead className="text-center text-red-400 font-semibold">
                Telat
              </TableHead>
              <TableHead className="text-center text-orange-400 font-semibold">
                Awal Pulang
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emp.logs.map((log: AttendanceLog) => (
              <TableRow
                key={log.date}
                className={`border-b border-gray-800 ${log.isSpecialWorkDay ? "bg-amber-900/10" : ""} ${log.isAbsent ? "bg-red-900/10" : ""} ${log.isHoliday ? "bg-red-900/20" : ""}`}
              >
                <TableCell className="font-medium pl-6 text-gray-200">
                  {log.date}
                </TableCell>
                <TableCell className="text-gray-400">
                  {log.dayName}
                  {log.isSpecialWorkDay && (
                    <StatusBadge color="amber" label="Wajib" />
                  )}
                  {log.isHoliday && (
                    <StatusBadge color="red" label="Tanggal Merah" />
                  )}
                  {log.isAbsent && (
                    <span className="text-red-400 text-[10px] ml-1.5 px-1.5 py-0.5 bg-red-900/30 rounded font-medium inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 inline" /> No FP
                    </span>
                  )}
                  {log.leaveType && (
                    <StatusBadge color="blue" label={log.leaveType} />
                  )}
                  {log.partialLeave && (
                    <StatusBadge
                      color="purple"
                      label={`${log.partialLeave.type} (${log.partialLeave.timeRange})`}
                    />
                  )}
                </TableCell>

                {log.isHoliday && !log.in && !log.isSpecialWorkDay ? (
                  <TableCell
                    colSpan={4}
                    className="text-center font-bold text-red-400"
                  >
                    LIBUR: {log.holidayName}
                  </TableCell>
                ) : (
                  <>
                    <TableCell className="text-center text-gray-300">
                      {log.in ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />{" "}
                          {log.in.substring(0, 5)}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-gray-300">
                      {log.out ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />{" "}
                          {log.out.substring(0, 5)}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      {log.isLateApproved && log.lateDuration !== "-" ? (
                        <span className="text-emerald-400 bg-emerald-900/20 border border-emerald-900/50 px-2 py-1 rounded text-sm whitespace-nowrap">
                          izin - {log.lateDuration}
                        </span>
                      ) : log.lateDuration && log.lateDuration !== "-" ? (
                        <span className="text-red-400 bg-red-900/20 px-2 py-1 rounded text-sm">
                          {log.lateDuration}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      {log.isEarlyApproved && log.earlyLeaveDuration !== "-" ? (
                        <span className="text-emerald-400 bg-emerald-900/20 border border-emerald-900/50 px-2 py-1 rounded text-sm whitespace-nowrap">
                          izin - {log.earlyLeaveDuration}
                        </span>
                      ) : log.earlyLeaveDuration &&
                        log.earlyLeaveDuration !== "-" ? (
                        <span className="text-orange-400 bg-orange-900/20 px-2 py-1 rounded text-sm">
                          {log.earlyLeaveDuration}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
