/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import { settingJurusanProdiService } from "@/services/settingJurusanProdiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Settings2 } from "lucide-react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const MappingProdiByPtPage = () => {
    useRedirectIfHasNotAccess("R"); 


  const { id_pt } = useParams<{ id_pt: string }>();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // State untuk Modal Kelola Jurusan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<any>(null);
  const [jurusanPage, setJurusanPage] = useState(1);
  const [jurusanSearch, setJurusanSearch] = useState("");
  const debouncedJurusanSearch = useDebounce(jurusanSearch, 500);

  // 1. Fetch Prodi berdasarkan PT
  const { data: prodiResponse, isLoading } = useQuery({
    queryKey: ["mapping-prodi-by-pt", id_pt, page, debouncedSearch],
    queryFn: () => settingJurusanProdiService.getMappingProdiByPt(id_pt!, page, debouncedSearch),
    enabled: !!id_pt,
    staleTime: STALE_TIME,
  });

  const prodiData = prodiResponse?.data?.result ?? [];
  const prodiTotalPages = prodiResponse?.data?.total_pages || 1;

  // 2. Fetch Jurusan berdasarkan Prodi (Untuk di dalam Modal)
  const { data: jurusanResponse, isLoading: isLoadingJurusan } = useQuery({
    queryKey: ["mapping-jurusan-by-prodi", selectedProdi?.id_prodi, jurusanPage, debouncedJurusanSearch],
    queryFn: () => settingJurusanProdiService.getMappingJurusanByProdi(selectedProdi.id_prodi, jurusanPage, debouncedJurusanSearch),
    enabled: !!selectedProdi,
    staleTime: STALE_TIME,
  });

  const jurusanData = jurusanResponse?.data?.result ?? [];
  const jurusanTotalPages = jurusanResponse?.data?.total_pages || 1;

  // 3. Mutation untuk Toggle Mapping
  const toggleMutation = useMutation({
    mutationFn: (payload: { id_jurusan_sekolah: number; id_pt: number; id_prodi: number; is_mapped: boolean }) =>
      settingJurusanProdiService.toggleMappingProdi(payload),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Status mapping berhasil diperbarui.");
      // Invalidate query agar tabel utama (badges) dan tabel modal ikut terupdate
      queryClient.invalidateQueries({ queryKey: ["mapping-prodi-by-pt", id_pt] });
      queryClient.invalidateQueries({ queryKey: ["mapping-jurusan-by-prodi", selectedProdi?.id_prodi] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal mengubah status mapping.");
    }
  });

  const handleToggle = (idJurusan: number, currentStatus: boolean) => {
    toggleMutation.mutate({
      id_jurusan_sekolah: idJurusan,
      id_pt: Number(id_pt),
      id_prodi: selectedProdi.id_prodi,
      is_mapped: !currentStatus
    });
  };

  const openManageModal = (prodi: any) => {
    setSelectedProdi(prodi);
    setJurusanPage(1);
    setJurusanSearch("");
    setIsModalOpen(true);
  };

  // Columns Utama (Tabel Prodi)
  const columns = useMemo(() => [
    {
      id: "no",
      header: "No",
      cell: ({ row }: any) => <span className="text-slate-500">{row.index + 1 + (page - 1) * 10}</span>,
    },
    {
      accessorKey: "nama_prodi",
      header: "Program Studi",
      cell: ({ row }: any) => <span className="font-bold text-slate-900">{row.original.nama_prodi}</span>
    },
    {
      id: "mapped_jurusan",
      header: "Jurusan Sekolah Terhubung",
      cell: ({ row }: any) => {
        const mapped = row.original.mapped_jurusan || [];
        if (mapped.length === 0) return <span className="text-slate-400 italic text-sm">Belum ada jurusan terhubung</span>;
        
        return (
          <div className="flex flex-wrap gap-1.5">
            {mapped.map((m: any) => (
              <Badge key={m.id_mapping} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                {m.jurusan_sekolah}
              </Badge>
            ))}
          </div>
        );
      }
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }: any) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          onClick={() => openManageModal(row.original)}
        >
          <Settings2 className="w-4 h-4 mr-2" /> Kelola Jurusan
        </Button>
      )
    }
  ], [page]);

// Columns Modal (Tabel Jurusan)
  const modalColumns = useMemo(() => [
    {
      id: "no",
      header: "No",
      cell: ({ row }: any) => <span className="text-slate-500">{row.index + 1 + (jurusanPage - 1) * 10}</span>,
    },
    {
      accessorKey: "jurusan",
      header: "Jurusan Sekolah",
      cell: ({ row }: any) => <span className="font-medium text-slate-800">{row.original.jurusan}</span>
    },
    {
      id: "is_mapped",
      header: "Terhubung",
      cell: ({ row }: any) => (
        <Switch 
          checked={row.original.is_mapped} 
          // Sekarang handleToggle akan menerima selectedProdi yang benar
          onCheckedChange={() => handleToggle(row.original.id_jurusan_sekolah, row.original.is_mapped)}
          disabled={toggleMutation.isPending}
          className="data-[state=checked]:bg-emerald-600"
        />
      )
    }
  // ✅ TAMBAHKAN `selectedProdi` DI DALAM ARRAY INI:
  ], [jurusanPage, toggleMutation.isPending, selectedProdi]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Perguruan Tinggi", path: "/master/perguruan-tinggi" }, { name: "Mapping Prodi & Jurusan" }]} />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <Link2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Mapping Prodi & Jurusan</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola relasi jurusan sekolah untuk masing-masing program studi di kampus ini.</p>
            </div>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
             <CardTitle className="text-xl font-bold text-slate-800">Daftar Program Studi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 sm:p-8">
              <DataTable
                isLoading={isLoading}
                columns={columns}
                data={prodiData}
                pageCount={prodiTotalPages}
                pageIndex={page - 1}
                onPageChange={(newPage) => setPage(newPage + 1)}
                searchValue={search}
                onSearchChange={(value) => setSearch(value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal Kelola Jurusan */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Kelola Jurusan untuk Prodi <span className="text-emerald-600">{selectedProdi?.nama_prodi}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <DataTable
                isLoading={isLoadingJurusan}
                columns={modalColumns}
                data={jurusanData}
                pageCount={jurusanTotalPages}
                pageIndex={jurusanPage - 1}
                onPageChange={(newPage) => setJurusanPage(newPage + 1)}
                searchValue={jurusanSearch}
                onSearchChange={(value) => setJurusanSearch(value)}
              />
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default MappingProdiByPtPage;