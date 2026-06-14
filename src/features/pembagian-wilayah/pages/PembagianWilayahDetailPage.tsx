/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { getDetailColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";
import { Users, ArrowLeft, Settings2, CheckSquare, Clock } from "lucide-react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const PembagianWilayahDetailPage = () => {
  useRedirectIfHasNotAccess("R"); 
  const { kodeKab } = useParams<{ kodeKab: string }>();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["detail-administrasi", kodeKab],
    queryFn: () => beasiswaService.getDetailLulusAdministrasi(kodeKab as string),
    enabled: !!kodeKab,
  });

  const { data: logResponse } = useQuery({
    queryKey: ["last-log-kewilayahan"],
    queryFn: () => beasiswaService.getLastLogKewilayahan(),
  });

  if (isError) toast.error("Gagal memuat detail pendaftar.");

  const rawData = response?.data || [];
  const lastLog = logResponse?.data;

  const filteredData = useMemo(() => {
    if (!search) return rawData;
    const lowerSearch = search.toLowerCase();
    return rawData.filter((item: any) => 
      (item.nama_lengkap || "").toLowerCase().includes(lowerSearch) ||
      (item.nama_beasiswa || "").toLowerCase().includes(lowerSearch)
    );
  }, [rawData, search]);

  const handleToggleSelect = (idTrx: number) => {
    setSelectedIds((prev) => 
      prev.includes(idTrx) ? prev.filter(id => id !== idTrx) : [...prev, idTrx]
    );
  };

  const handleToggleSelectAll = (checked: boolean, data: any[]) => {
    if (checked) {
      const allIds = data.map(item => item.id_trx_beasiswa);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSubmitBulk = async () => {
    if (selectedIds.length === 0) return toast.warning("Pilih minimal satu data terlebih dahulu.");
    if (!bulkAction) return toast.warning("Pilih opsi kewilayahan pada combobox.");

    setIsSubmitting(true);
    try {
      const payload = {
        id_trx_beasiswa: selectedIds,
        flag_kewilayahan: parseInt(bulkAction)
      };
      
      const res = await beasiswaService.updateFlagKewilayahan(payload);
      
      if (res.success) {
        toast.success("Kewilayahan pendaftar terpilih berhasil diubah.");
        setSelectedIds([]);
        setBulkAction("");
        queryClient.invalidateQueries({ queryKey: ["detail-administrasi", kodeKab] });
        queryClient.invalidateQueries({ queryKey: ["last-log-kewilayahan"] });
      }
    } catch (error) {
      toast.error("Gagal mengubah kewilayahan massal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => 
    getDetailColumns(selectedIds, handleToggleSelect, handleToggleSelectAll, filteredData), 
  [selectedIds, filteredData]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Pembagian Wilayah", url: "/pembagian_wilayah" }, { name: "Detail Kewilayahan" }]} />
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-emerald-50 rounded-2xl hidden sm:block mt-1 border border-emerald-100">
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Detail Pendaftar Wilayah
              </h2>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Centang pendaftar pada tabel, pilih penempatan kewilayahan, lalu klik Submit untuk memproses data.
              </p>
            </div>
          </div>
          
          <Link to="/pembagian_wilayah" className="shrink-0">
            <Button variant="outline" className="flex items-center gap-2 shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl h-11 px-5 transition-all w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 text-slate-400" />
              Kembali ke Rekap
            </Button>
          </Link>
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

        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
            <CardTitle className="text-xl text-slate-800 font-bold">Daftar Pelamar Administrasi Lulus</CardTitle>
            <CardDescription className="text-slate-500 mt-1.5">
              Kelola penempatan kewilayahan pendaftar secara spesifik di daerah ini.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 bg-slate-50/80 p-5 border border-slate-200 rounded-2xl shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm shrink-0">
                    <Settings2 className="h-4 w-4" />
                    Aksi Massal
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <Select value={bulkAction} onValueChange={setBulkAction} disabled={isSubmitting}>
                      <SelectTrigger className="w-full sm:w-[220px] bg-white h-11 rounded-xl transition-colors focus:ring-emerald-500/20 focus:border-emerald-500 border-slate-300 font-medium text-slate-700">
                        <SelectValue placeholder="Pilih Kewilayahan..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        <SelectItem value="0" className="font-medium">SESUAI KTP</SelectItem>
                        <SelectItem value="1" className="font-medium">BEKERJA</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleSubmitBulk} 
                      disabled={selectedIds.length === 0 || !bulkAction || isSubmitting}
                      className="h-11 px-8 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all w-full sm:w-auto"
                    >
                      {isSubmitting ? "Memproses..." : "SUBMIT"}
                    </Button>
                  </div>
                </div>

                <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border font-bold text-sm w-full lg:w-auto justify-center whitespace-nowrap transition-colors shadow-sm ${selectedIds.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                  <CheckSquare className={`h-4 w-4 ${selectedIds.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  {selectedIds.length} Baris Dipilih
                </div>
              </div>

              <div className="w-full">
                <DataTable
                  isLoading={isLoading || isSubmitting}
                  columns={columns}
                  data={filteredData}
                  pageCount={1}
                  pageIndex={0}
                  onPageChange={() => {}}
                  searchValue={search}
                  onSearchChange={(val) => setSearch(val)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PembagianWilayahDetailPage;