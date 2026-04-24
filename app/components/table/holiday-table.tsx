"use client";

import React from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Holiday {
  id: string;
  date: string;
  description: string;
  users: { id: string; name: string; niy: string }[];
}

interface HolidayTableProps {
  holidays: Holiday[];
  isLoading: boolean;
  onAssign: (holiday: Holiday) => void;
  onEdit: (holiday: Holiday) => void;
  onDelete: (id: string) => void;
}

export const HolidayTable = React.memo(function HolidayTable({
  holidays,
  isLoading,
  onAssign,
  onEdit,
  onDelete,
}: HolidayTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Berlaku untuk</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : holidays.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Belum ada data hari libur.
              </TableCell>
            </TableRow>
          ) : (
            holidays.map((h) => (
              <TableRow key={h.id}>
                <TableCell>
                  {new Date(h.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>{h.description}</TableCell>
                <TableCell>
                  {h.users.length === 0 ? (
                    <Badge variant="secondary">Semua Pegawai</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {h.users.slice(0, 2).map((u) => (
                        <Badge key={u.id} variant="outline">
                          {u.name}
                        </Badge>
                      ))}
                      {h.users.length > 2 && (
                        <Badge variant="outline">
                          +{h.users.length - 2} lainnya
                        </Badge>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssign(h)}
                  >
                    <Users className="w-4 h-4 mr-1" /> Assign
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(h)}>
                    <Pencil className="w-4 h-4 text-orange-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(h.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});
