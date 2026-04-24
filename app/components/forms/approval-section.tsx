"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckSquare, Paperclip, Calendar } from "lucide-react";
import {
  ApprovalForm,
  ApprovalRequestData,
  SubstituteUser,
} from "./approval-form";

interface ApprovalSectionProps {
  incomingRequests: ApprovalRequestData[];
  potentialSubstitutes: SubstituteUser[];
}

export function ApprovalSection({
  incomingRequests,
  potentialSubstitutes,
}: ApprovalSectionProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequestData | null>(null);

  if (incomingRequests.length === 0) return null;

  return (
    <>
      <Card className="shadow-md border-gray-800 bg-gray-900 mb-8 overflow-hidden">
        <CardHeader className="bg-crimson-950/30 border-b border-crimson-900/50 pb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-200">
              Perlu Persetujuan Anda
            </CardTitle>
          </div>
          <CardDescription className="text-red-500">
            Ada {incomingRequests.length} pengajuan bawahan yang menunggu.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 bg-gray-900">
          {incomingRequests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-950 shadow-sm gap-4"
            >
              <div className="space-y-2">
                <p className="font-bold text-white text-lg">{req.user?.name}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-gray-800 text-gray-300 border-gray-700"
                  >
                    {req.type === "CUTI"
                      ? "Cuti Tahunan"
                      : `Izin (${req.user?.category || "Umum"})`}
                  </Badge>

                  {/* INFO TANGGAL */}
                  <div className="flex items-center gap-1 text-xs text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-800/50">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(req.startDate))}
                      {" - "}
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(req.endDate))}
                    </span>
                  </div>
                </div>

                {req.reason && (
                  <p className="text-sm text-gray-400 italic font-light">
                    &quot;{req.reason}&quot;
                  </p>
                )}

                {/* LINK SURAT DOKTER / BUKTI */}
                {req.attachmentUrl && (
                  <div className="pt-1">
                    <a
                      href={req.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-colors bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      Lihat Bukti / Surat Dokter
                    </a>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setSelectedRequest(req)}
                className="bg-red-500 hover:bg-crimson-800 text-white font-semibold shadow-sm"
              >
                Proses Sekarang
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-w-xl bg-gray-950 text-gray-100 border-gray-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Tindak Lanjut Pengajuan
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <ApprovalForm
              request={selectedRequest}
              potentialSubstitutes={potentialSubstitutes}
              onClose={() => setSelectedRequest(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
