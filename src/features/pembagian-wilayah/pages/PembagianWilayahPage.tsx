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
import { Map, MapPin, Settings2, Clock, Send } from "lucide-react"; 
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const PembagianWilayahPage = () => {
  useRedirectIfHasNotAccess("R"); 

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0); 
  const pageSize = 10; 

  const [globalAction, setGlobalAction] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSendModal, setShowSendModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setPageIndex(0);
  }, [search]);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["rekap-administrasi", pageIndex, search],
    queryFn: () => beasiswaService.getRekapLulusAdministrasi("all", pageIndex + 1, pageSize, search),
  });

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

  const totalBelumSet = response?.data?.total_belum_set ?? 0; 
  const isReadyToSend = totalRows > 0 && totalBelumSet === 0;

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
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Pembagian Wilayah" }]} />
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-emerald-50 rounded-2xl hidden sm:block mt-1 border border-emerald-100">
              <Map className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Rekapitulasi Pendaftar
              </h2>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Ubah kewilayahan pendaftar secara global atau klik nama Kabupaten/Kota pada tabel untuk pengaturan detail.
              </p>
            </div>
          </div>
          
          {isReadyToSend && (
            <Button 
              onClick={() => setShowSendModal(true)} 
              className="flex items-center gap-2 shadow-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 transition-all animate-in fade-in zoom-in duration-300 w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              Kirim Data Final
            </Button>
          )}
        </div>

        {lastLog && (
          <div className="bg-teal-50 border border-teal-100 text-teal-800 px-5 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <Clock className="h-6 w-6 text-teal-500 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-sm">
              <span className="font-bold text-teal-900">Terakhir Diperbarui:</span>
              <span className="font-medium">{new Date(lastLog.timestamp).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "medium" })} WIB</span>
              <span className="hidden sm:inline-block text-teal-300">•</span>
              <span className="italic text-teal-700">"{lastLog.ket}"</span>
            </div>
          </div>
        )}

        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
            <CardTitle className="text-xl text-slate-800 font-bold">Perbandingan Wilayah Domisili dan Tempat Bekerja</CardTitle>
            <CardDescription className="text-slate-500 mt-1.5">
              Menampilkan rekapitulasi jumlah pendaftar berdasarkan wilayah domisili dan tempat bekerja.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 bg-slate-50/80 p-5 border border-slate-200 rounded-2xl shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm shrink-0">
                    <Settings2 className="h-4 w-4" />
                    Aksi Massal Global
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <Select value={globalAction} onValueChange={setGlobalAction} disabled={isSubmitting}>
                      <SelectTrigger className="w-full sm:w-[320px] bg-white h-11 rounded-xl transition-colors focus:ring-emerald-500/20 focus:border-emerald-500 border-slate-300 font-medium text-slate-700">
                        <SelectValue placeholder="Pilih Kewilayahan Seluruh Data..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        <SelectItem value="0" className="font-medium">Terapkan SESUAI KTP ke Semua</SelectItem>
                        <SelectItem value="1" className="font-medium">Terapkan BEKERJA ke Semua</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => setShowConfirmModal(true)} 
                      disabled={!globalAction || isSubmitting}
                      className="h-11 px-8 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all w-full sm:w-auto"
                    >
                      TERAPKAN
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white text-slate-600 px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm w-full lg:w-auto justify-center whitespace-nowrap shadow-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Total: {totalRows} Wilayah
                </div>
              </div>

              <div className="w-full">
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

            </div>
          </CardContent>
        </Card>

        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3.5 bg-amber-100 rounded-2xl text-amber-600">
                  <Settings2 className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Aksi Massal</h3>
              </div>
              <p className="text-slate-600 mb-8 text-base leading-relaxed">
                Apakah Anda yakin ingin merubah kewilayahan <span className="font-extrabold text-amber-600">SELURUH</span> pendaftar di semua wilayah menjadi 
                <span className="font-bold text-slate-900">{globalAction === "1" ? " SESUAI ALAMAT BEKERJA" : " SESUAI KTP"}</span>?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmModal(false)} 
                  disabled={isSubmitting}
                  className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleGlobalSubmit} 
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-11 px-6 shadow-md"
                >
                  {isSubmitting ? "Memproses..." : "Ya, Lanjutkan"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showSendModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3.5 bg-emerald-100 rounded-2xl text-emerald-600">
                  <Send className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Kirim Data?</h3>
              </div>
              <p className="text-slate-600 mb-8 text-base leading-relaxed">
                Apakah Anda yakin proses pembagian wilayah sudah selesai? Semua pendaftar yang saat ini berada di tahap ini akan diteruskan ke tahap seleksi selanjutnya.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSendModal(false)} 
                  disabled={isSending}
                  className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleSendSubmit} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-md" 
                  disabled={isSending}
                >
                  {isSending ? "Mengirim..." : "Ya, Kirim Data"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PembagianWilayahPage;