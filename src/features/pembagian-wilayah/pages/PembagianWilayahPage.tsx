/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { getRekapColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, MapPin, Settings2, Clock, Send } from "lucide-react"; // <-- Tambahkan icon Send

const PembagianWilayahPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0); 
  const pageSize = 10; 

  // State untuk Aksi Massal Global
  const [globalAction, setGlobalAction] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Kirim Data (Flow 13 -> 6)
  const [showSendModal, setShowSendModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setPageIndex(0);
  }, [search]);

  // Fetch Data Tabel
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["rekap-administrasi", pageIndex, search],
    queryFn: () => beasiswaService.getRekapLulusAdministrasi("all", pageIndex + 1, pageSize, search),
  });

  // Fetch Last Log
  const { data: logResponse } = useQuery({
    queryKey: ["last-log-kewilayahan"],
    queryFn: () => beasiswaService.getLastLogKewilayahan(),
  });

  if (isError) toast.error("Gagal memuat rekapitulasi data pendaftar.");

  const rawData = response?.data?.data || [];
  const paginationData = response?.data?.pagination || {};
  const pageCount = paginationData.totalPages || 1;
  const totalRows = paginationData.totalRows || 0;
  const lastLog = logResponse?.data;

  const columns = useMemo(() => getRekapColumns(), []);

  const handleGlobalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        is_global: true,
        flag_kewilayahan: parseInt(globalAction),
      };

      const res = await beasiswaService.updateFlagKewilayahan(payload);
      if (res.success) {
        toast.success("Kewilayahan seluruh data berhasil diperbarui!");
        queryClient.invalidateQueries({ queryKey: ["rekap-administrasi"] });
        queryClient.invalidateQueries({ queryKey: ["last-log-kewilayahan"] });
        setGlobalAction("");
        setShowConfirmModal(false);
      }
    } catch (error) {
      toast.error("Gagal melakukan aksi massal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendSubmit = async () => {
    setIsSending(true);
    try {
      const res = await beasiswaService.kirimPembagianWilayah();
      if (res.success) {
        toast.success("Data berhasil dikirim ke tahap selanjutnya!");
        queryClient.invalidateQueries({ queryKey: ["rekap-administrasi"] });
        setShowSendModal(false);
      }
    } catch (error) {
      toast.error("Gagal mengirim data. Pastikan tidak ada gangguan server.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Pembagian Wilayah" }]} />
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Rekapitulasi Pendaftar (Lulus Administrasi)
          </h2>
          <p className="text-sm text-gray-500 mt-1 md:ml-8">
            Ubah kewilayahan pendaftar secara global atau klik nama Kabupaten/Kota untuk detail.
          </p>
        </div>
        
        {/* Tombol Kirim Data */}
        <Button 
          onClick={() => setShowSendModal(true)} 
          className="flex items-center gap-2 shadow-sm font-semibold bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4" />
          Kirim Data (Selesai Kewilayahan)
        </Button>
      </div>

      {/* Last Edited Banner */}
      {lastLog && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
          <Clock className="h-5 w-5 text-blue-500 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
            <span className="font-semibold">Terakhir Diperbarui:</span>
            <span>{new Date(lastLog.timestamp).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "medium" })} WIB</span>
            <span className="hidden sm:inline-block text-blue-300">•</span>
            <span className="italic">"{lastLog.ket}"</span>
          </div>
        </div>
      )}

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        {/* ... (Sisa konten Card sama seperti sebelumnya) ... */}
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-base text-gray-800">Perbandingan Data KTP dan Alamat Berkebun</CardTitle>
          <CardDescription>
            Menampilkan rekapitulasi jumlah pendaftar berdasarkan wilayah domisili dan perkebunan.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-white bg-primary px-3 py-2 rounded-md font-medium text-sm shadow-sm">
                <Settings2 className="h-4 w-4" />
                <span>AKSI MASSAL GLOBAL:</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select value={globalAction} onValueChange={setGlobalAction} disabled={isSubmitting}>
                  <SelectTrigger className="w-full sm:w-[280px] bg-gray-50 h-10 transition-colors focus:bg-white border-gray-300">
                    <SelectValue placeholder="Pilih Kewilayahan Seluruh Data..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Terapkan SESUAI KTP ke Semua</SelectItem>
                    <SelectItem value="1">Terapkan BERKEBUN ke Semua</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setShowConfirmModal(true)} 
                  disabled={!globalAction || isSubmitting}
                  className="h-10 px-6 font-semibold"
                >
                  TERAPKAN
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full border border-gray-200 font-semibold text-sm w-full sm:w-auto justify-center whitespace-nowrap">
              <MapPin className="h-4 w-4" />
              Total: {totalRows} Wilayah
            </div>
          </div>

          <div className="rounded-md border border-gray-100 bg-white shadow-sm">
            <DataTable
              isLoading={isLoading}
              columns={columns}
              data={rawData} 
              pageCount={pageCount} 
              pageIndex={pageIndex} 
              onPageChange={(newPageIndex) => setPageIndex(newPageIndex)} 
              searchValue={search}
              onSearchChange={(val) => setSearch(val)}
            />
          </div>

        </CardContent>
      </Card>

      {/* MODAL KONFIRMASI AKSI MASSAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Aksi Massal</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Apakah Anda yakin ingin merubah kewilayahan <span className="font-bold text-red-600">SELURUH</span> pendaftar di semua wilayah menjadi <span className="font-bold">{globalAction === "1" ? "SESUAI ALAMAT BERKEBUN" : "SESUAI KTP"}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Batal</Button>
              <Button onClick={handleGlobalSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Ya, Lanjutkan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI KIRIM DATA (FLOW 13 -> 6) */}
      {showSendModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Kirim Data Pendaftar?</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Apakah Anda yakin proses pembagian wilayah sudah selesai? Semua pendaftar yang saat ini berada di tahap ini akan diteruskan ke tahap seleksi selanjutnya.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSendModal(false)} disabled={isSending}>Batal</Button>
              <Button onClick={handleSendSubmit} className="bg-green-600 hover:bg-green-700" disabled={isSending}>
                {isSending ? "Mengirim..." : "Ya, Kirim Data"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PembagianWilayahPage;