import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jalurMasterService } from "@/services/jalurMasterService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { IJalurMaster } from "@/types/jalurMaster";

const JalurPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State Pagination & Search
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  // State Dialog Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ jalur: "" });

  // Logika Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPage(1); // Reset ke halaman 1 saat pencarian berubah
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Fetching Data
  const { data: response, isLoading } = useQuery({
    queryKey: ["master-jalur", page, debouncedSearch],
    queryFn: () => jalurMasterService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => jalurMasterService.create(formData),
    onSuccess: () => {
      toast.success("Berhasil menambahkan data jalur");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-jalur"] });
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const updateMutation = useMutation({
    mutationFn: () => jalurMasterService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Berhasil mengubah data jalur");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-jalur"] });
    },
    onError: () => toast.error("Gagal mengubah data"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jalurMasterService.delete(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus data jalur");
      queryClient.invalidateQueries({ queryKey: ["master-jalur"] });
    },
    onError: () => toast.error("Gagal menghapus data"),
  });

  // Handlers
  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({ jalur: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IJalurMaster) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({ jalur: data.jalur });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus jalur ${nama}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jalur.trim()) {
      return toast.warning("Nama jalur tidak boleh kosong");
    }
    
    if (modalMode === "create") createMutation.mutate();
    else updateMutation.mutate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setFormData({ jalur: "" });
  };

  const columns = getColumns(page, limit, handleEditClick, handleDeleteClick);

  return (
    <div className="p-6 space-y-6">
      <CustBreadcrumb items={[{ name: "Master Jalur", url: "/master/jalur" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Jalur</h1>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Tambah Data Jalur
        </Button>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50/80 p-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Daftar Jalur</CardTitle>
            {/* Input Search yang ada di sini sebelumnya sudah Dihapus */}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500 animate-pulse">Memuat data...</div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
              // Menambahkan props search untuk digunakan di dalam DataTable
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Tambah Data Jalur" : "Edit Jalur"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jalur">Nama Jalur</Label>
              <Input
                id="jalur"
                value={formData.jalur}
                onChange={(e) => setFormData({ ...formData, jalur: e.target.value })}
                autoFocus
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Menyimpan" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JalurPage;