import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { referensiWilayahService } from "@/services/referensiWilayahService";
import { DataTable } from "@/components/DataTable";
import { getColumnsWilayah } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { IReferensiWilayah } from "@/types/wilayah";

const ReferensiWilayahPage: React.FC = () => {
  const { kodePro, kodeKab } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Menentukan Level Data saat ini berdasarkan URL params
  const level = kodeKab ? "kecamatan" : kodePro ? "kabkota" : "provinsi";

  // State Pagination & Search
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Untuk input UI (real-time)
  const [debouncedSearch, setDebouncedSearch] = useState<string>(""); // Untuk nembak API (delay)
  
  // State Dialog Modal
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWilayah, setSelectedWilayah] = useState<IReferensiWilayah | null>(null);
  const [editName, setEditName] = useState("");

  // ======================
  // LOGIKA DEBOUNCE SEARCH
  // ======================
  useEffect(() => {
    // Tunggu 500ms setelah user berhenti ngetik, baru update debouncedSearch
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPageIndex(0); // Reset ke halaman pertama setiap kali melakukan pencarian baru
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Reset state ketika pindah level wilayah
  useEffect(() => {
    setPageIndex(0);
    setSearchTerm("");
    setDebouncedSearch("");
  }, [level, kodePro, kodeKab]);

  // ======================
  // FETCHING DATA
  // ======================
  const { data: response, isLoading } = useQuery({
    // Pakai debouncedSearch di queryKey agar fetch jalan HANYA saat debouncedSearch berubah
    queryKey: ["wilayah", level, kodePro, kodeKab, pageIndex, debouncedSearch],
    queryFn: () => {
      const currentPage = pageIndex + 1; // Backend pakai basis 1
      
      if (level === "kecamatan") return referensiWilayahService.getKecamatanPaginated(Number(kodeKab), currentPage, debouncedSearch);
      if (level === "kabkota") return referensiWilayahService.getKabKotaPaginated(Number(kodePro), currentPage, debouncedSearch);
      return referensiWilayahService.getProvinsiPaginated(currentPage, debouncedSearch);
    },
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  // ======================
  // LOGIKA AKSI (EDIT & DELETE)
  // ======================
  const handleEditClick = (data: IReferensiWilayah) => {
    setSelectedWilayah(data);
    setEditName(data.nama_wilayah);
    setIsEditDialogOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: () => referensiWilayahService.updateWilayah(selectedWilayah!.wilayah_id, editName),
    onSuccess: () => {
      toast.success("Berhasil mengubah nama wilayah");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
    },
    onError: () => toast.error("Gagal mengubah data wilayah"),
  });

  const handleDeleteClick = (id: number, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus wilayah ${nama}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => referensiWilayahService.deleteWilayah(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus wilayah");
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
    },
    onError: () => toast.error("Gagal menghapus data wilayah"),
  });

  const columns = getColumnsWilayah(level, handleEditClick, handleDeleteClick);

  // Setup Breadcrumbs dinamis
  const breadcrumbItems = [
    { name: "Master Wilayah", url: "/master/referensi-wilayah" }
  ];
  if (kodePro) breadcrumbItems.push({ name: "Kabupaten / Kota", url: `/master/referensi-wilayah/${kodePro}` });
  if (kodeKab) breadcrumbItems.push({ name: "Kecamatan", url: `/master/referensi-wilayah/${kodePro}/${kodeKab}` });

  return (
    <div className="p-6 space-y-6">
      <CustBreadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 capitalize">Master {level}</h1>
          <p className="text-sm text-gray-500">Kelola data wilayah secara berjenjang.</p>
        </div>
        
        {level !== "provinsi" && (
          <Button variant="outline" onClick={() => navigate(-1)}>
            Kembali ke Tingkat Sebelumnya
          </Button>
        )}
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50/80 p-4">
          <CardTitle className="text-lg">Daftar {level}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {isLoading && tableData.length === 0 ? (
            <div className="py-12 text-center text-gray-500 animate-pulse">Memuat data wilayah...</div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              pageCount={totalPages}
              pageIndex={pageIndex}
              onPageChange={(newPageIndex) => setPageIndex(newPageIndex)}
              // 👇 Hubungkan state real-time (searchTerm) ke input UI DataTable
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </CardContent>
      </Card>

      {/* MODAL EDIT WILAYAH */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Nama Wilayah</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-1 block text-gray-700">Nama Wilayah Baru</label>
            <Input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              placeholder="Masukkan nama wilayah..." 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button 
              onClick={() => updateMutation.mutate()} 
              disabled={updateMutation.isPending || !editName.trim()}
            >
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferensiWilayahPage;