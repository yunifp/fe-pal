/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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

const PembagianWilayahDetailPage = () => {
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

  // Fetch Last Log
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
        id_trx_beasiswa: selectedIds, // Sekarang langsung mengirim Array ID
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
    <div className="space-y-6 pb-8">
      <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Pembagian Wilayah", url: "/pembagian_wilayah" }, { name: "Detail Kewilayahan" }]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Detail Pendaftar Berdasarkan Wilayah
          </h2>
          <p className="text-sm text-gray-500 mt-1 md:ml-8">
            Centang pendaftar pada tabel, pilih penempatan kewilayahan, lalu klik Submit.
          </p>
        </div>
        <Link to="/pembagian_wilayah">
          <Button variant="outline" className="flex items-center gap-2 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Rekap
          </Button>
        </Link>
      </div>

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
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-base text-gray-800">Daftar Pelamar Administrasi Lulus</CardTitle>
          <CardDescription>
            Kelola penempatan kewilayahan pendaftar secara spesifik di daerah ini.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-white bg-primary px-3 py-2 rounded-md font-medium text-sm shadow-sm">
                <Settings2 className="h-4 w-4" />
                <span>Aksi Massal:</span>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select value={bulkAction} onValueChange={setBulkAction} disabled={isSubmitting}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-gray-50 h-10 transition-colors focus:bg-white border-gray-300">
                    <SelectValue placeholder="Pilih Kewilayahan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">SESUAI KTP</SelectItem>
                    <SelectItem value="1">BERKEBUN</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleSubmitBulk} 
                  disabled={selectedIds.length === 0 || !bulkAction || isSubmitting}
                  className="h-10 px-6 font-semibold"
                >
                  {isSubmitting ? "Memproses..." : "SUBMIT"}
                </Button>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm w-full sm:w-auto justify-center whitespace-nowrap transition-colors ${selectedIds.length > 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
              <CheckSquare className="h-4 w-4" />
              {selectedIds.length} Baris Dipilih
            </div>
          </div>

          <div className="rounded-md border border-gray-100 bg-white shadow-sm">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PembagianWilayahDetailPage;