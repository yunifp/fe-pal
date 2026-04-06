import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wilayahKhususService } from "@/services/wilayahKhususService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { IWilayahKhusus } from "@/types/wilayahKhusus";

const WilayahKhususPage: React.FC = () => {
  const queryClient = useQueryClient();

  // === STATE DATA & FILTER ===
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // === STATE MODAL EDIT ===
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWilayah, setSelectedWilayah] = useState<IWilayahKhusus | null>(null);
  const [editFlags, setEditFlags] = useState({
    wilayah_3t: false,
    wilayah_perbatasan: false,
    wilayah_papua_nusateng: false,
  });

  // Delay untuk pencarian agar API tidak dispam
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPage(1); // Reset ke halaman pertama setiap kali melakukan pencarian baru
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Fetch Data menggunakan React Query
  const { data: response, isLoading } = useQuery({
    queryKey: ["wilayah-khusus", page, debouncedSearch],
    queryFn: () => wilayahKhususService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  // === AKSI EDIT ===
  const handleEditClick = (data: IWilayahKhusus) => {
    setSelectedWilayah(data);
    setEditFlags({
      wilayah_3t: data.wilayah_3t,
      wilayah_perbatasan: data.wilayah_perbatasan,
      wilayah_papua_nusateng: data.wilayah_papua_nusateng,
    });
    setIsEditDialogOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: () => wilayahKhususService.update(selectedWilayah!.wilayah_id, editFlags),
    onSuccess: () => {
      toast.success("Berhasil mengubah status wilayah khusus");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["wilayah-khusus"] });
    },
    onError: () => toast.error("Gagal mengubah data wilayah"),
  });

  // === AKSI RESET / HAPUS ===
  const handleResetClick = (id: number, nama: string) => {
    if (window.confirm(`Yakin ingin me-reset (menghapus status khusus) dari ${nama}?`)) {
      resetMutation.mutate(id);
    }
  };

  const resetMutation = useMutation({
    mutationFn: (id: number) => wilayahKhususService.reset(id),
    onSuccess: () => {
      toast.success("Berhasil me-reset status wilayah khusus");
      queryClient.invalidateQueries({ queryKey: ["wilayah-khusus"] });
    },
    onError: () => toast.error("Gagal mereset data wilayah"),
  });

  const columns = getColumns(handleEditClick, handleResetClick);

  return (
    <div className="p-6 space-y-6">
      <CustBreadcrumb items={[{ name: "Master Wilayah Khusus", url: "/master/wilayah-khusus" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Wilayah Khusus</h1>
          <p className="text-sm text-gray-500">Kelola status 3T, Perbatasan, dan Papua/Nusra untuk Kabupaten/Kota.</p>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50/80 p-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Daftar Kabupaten & Kota</CardTitle>
            {/* Input Search manual telah dihapus dari sini */}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500 animate-pulse">Memuat data wilayah...</div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
              // Hubungkan state real-time (searchTerm) ke input UI DataTable
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </CardContent>
      </Card>

      {/* MODAL EDIT STATUS */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Status Wilayah Khusus</DialogTitle>
            <DialogDescription>
              Atur status khusus untuk <strong>{selectedWilayah?.nama_kabkota}</strong>. Centang salah satu kriteria di bawah ini untuk menjadikan wilayah ini sebagai "Wilayah Khusus".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="c_3t" 
                checked={editFlags.wilayah_3t} 
                onCheckedChange={(checked) => setEditFlags({ ...editFlags, wilayah_3t: !!checked })} 
              />
              <label htmlFor="c_3t" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Termasuk Wilayah 3T
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="c_perbatasan" 
                checked={editFlags.wilayah_perbatasan} 
                onCheckedChange={(checked) => setEditFlags({ ...editFlags, wilayah_perbatasan: !!checked })} 
              />
              <label htmlFor="c_perbatasan" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Termasuk Wilayah Perbatasan
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="c_papuanusra" 
                checked={editFlags.wilayah_papua_nusateng} 
                onCheckedChange={(checked) => setEditFlags({ ...editFlags, wilayah_papua_nusateng: !!checked })} 
              />
              <label htmlFor="c_papuanusra" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Termasuk Papua & Nusa Tenggara
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button 
              onClick={() => updateMutation.mutate()} 
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WilayahKhususPage;