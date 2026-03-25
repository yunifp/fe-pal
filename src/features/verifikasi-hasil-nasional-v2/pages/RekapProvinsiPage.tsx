/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { beasiswaService } from "@/services/beasiswaService";
import { DataTable } from "@/components/DataTable";
import { columnsRekap } from "../components/columns_rekap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RekapProvinsiRow } from "@/types/beasiswa";

const RekapProvinsiPage: React.FC = () => {
  const [data, setData] = useState<RekapProvinsiRow[]>([]);
  const [stats, setStats] = useState<{ afirmasi: number; reguler: number }>({
    afirmasi: 0,
    reguler: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [openKirimDialog, setOpenKirimDialog] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await beasiswaService.getRekapProvinsiV2();
      if (res?.data) {
        setData(res.data.rekap || []);
        setStats({
          afirmasi: res.data.total_afirmasi || 0,
          reguler: res.data.total_reguler || 0,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKirimSeleksi = async () => {
    try {
      await beasiswaService.kirimSeleksiV2();
      toast.success("Berhasil dikirim ke Lembaga Seleksi!");
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal mengirim ke lembaga seleksi.");
    } finally {
      setOpenKirimDialog(false);
    }
  };

  const handleExportDetail = async () => {
    try {
      const res = await beasiswaService.exportDetailV2();
      const exportData = res.data as Record<string, string | number | null>[];

      if (!exportData || exportData.length === 0) {
        return toast.warning("Tidak ada data untuk dieksport.");
      }

      const headers = Object.keys(exportData[0]).join(",");
      const csvRows = exportData.map((row) =>
        Object.values(row)
          .map((value) => `"${value || ""}"`)
          .join(",")
      );
      const csvString = [headers, ...csvRows].join("\n");

      const blob = new Blob([csvString], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Data_Detail_Verifikasi_Nasional.csv";
      a.click();
      
      toast.success("Berhasil mengeksport data.");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal mengeksport data.");
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Verifikasi Nasional V2
          </h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleExportDetail}>
              Export Data Detail
            </Button>
            <Button 
              onClick={() => setOpenKirimDialog(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Kirim ke Lembaga Seleksi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Total Kluster Afirmasi
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-purple-700">
                {stats.afirmasi}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Pendaftar yang memenuhi kriteria 3T & Dokumen SKTM
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Total Kluster Reguler
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-blue-700">
                {stats.reguler}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Pendaftar yang masuk dalam kriteria reguler umum
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg text-gray-800">
              Rekapitulasi per Provinsi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="py-8 text-center text-gray-500 animate-pulse">
                Memuat data provinsi...
              </div>
            ) : (
              <DataTable
                columns={columnsRekap}
                data={data}
                pageCount={1}
                pageIndex={0}
                onPageChange={() => {}}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={openKirimDialog} onOpenChange={setOpenKirimDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengiriman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim semua data ke Lembaga Seleksi (Flow 10)? 
              Pastikan seluruh verifikasi kluster sudah sesuai sebelum melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenKirimDialog(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleKirimSeleksi}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Ya, Kirim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RekapProvinsiPage;