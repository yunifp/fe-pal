/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { getWawancaraColumns } from "../components/columns";
import { wawancaraService } from "../../../services/wawancaraService";
import { toast } from "sonner";
import { FileDown, Send, Users } from "lucide-react";

const WawancaraSeleksiPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["wawancara-list", pageIndex, search],
    queryFn: () => wawancaraService.getListWawancara(pageIndex + 1, pageSize, search),
  });

  if (isError) toast.error("Gagal memuat data wawancara.");

  const rawData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;
  const totalData = response?.data?.total || 0;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      wawancaraService.updateStatusWawancara(id, status),
    onSuccess: () => {
      toast.success("Status rekomendasi berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["wawancara-list"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui status.");
    }
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const columns = useMemo(() => 
    getWawancaraColumns(pageIndex, pageSize, handleUpdateStatus), 
  [pageIndex, pageSize]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await wawancaraService.downloadExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Rekap_Wawancara.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data Excel.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleKirimData = async () => {
    setIsSending(true);
    try {
      const res = await wawancaraService.kirimDataWawancara();
      if (res.success) {
        toast.success(res.message || "Data berhasil dikirim ke tahap selanjutnya!");
        queryClient.invalidateQueries({ queryKey: ["wawancara-list"] });
        setShowConfirmModal(false);
      }
    } catch (error) {
      toast.error("Gagal mengirim data.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Wawancara Seleksi" }]} />

      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Penilaian Wawancara Seleksi
          </h2>
          <p className="text-sm text-gray-500 mt-1 md:ml-8">
            Pilih status rekomendasi wawancara pada tabel di bawah ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 shadow-sm bg-white">
            <FileDown className="h-4 w-4" />
            {isDownloading ? "Mengunduh..." : "Download Rekap"}
          </Button>

          <Button 
            onClick={() => setShowConfirmModal(true)} 
            disabled={totalData === 0 || isSending}
            className="flex items-center gap-2 shadow-sm font-semibold bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
            Kirim Seleksi Selesai
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-base text-gray-800">Daftar Pendaftar Wawancara ({totalData} Total)</CardTitle>
          <CardDescription>Ubah status rekomendasi peserta secara langsung melalui kolom Status Wawancara.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-gray-100 bg-white shadow-sm">
            <DataTable
              isLoading={isLoading || updateStatusMutation.isPending}
              columns={columns}
              data={rawData}
              pageCount={totalPages}
              pageIndex={pageIndex}
              onPageChange={(newPageIndex) => setPageIndex(newPageIndex)}
              searchValue={search}
              onSearchChange={(val) => {
                setSearch(val);
                setPageIndex(0); 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Selesaikan Wawancara?</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Apakah Anda yakin proses wawancara telah selesai? Data pendaftar pada tahap ini akan dipindahkan ke tahap selanjutnya.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSending}>
                Batal
              </Button>
              <Button onClick={handleKirimData} className="bg-green-600 hover:bg-green-700" disabled={isSending}>
                {isSending ? "Memproses..." : "Ya, Kirim Data"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WawancaraSeleksiPage;