/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Calendar, Save, Loader2 } from "lucide-react";

// 1. PERBAIKAN IMPORT (Gunakan Named Import)
import { SectionHeader } from "@/components/SectionHeader";

const SettingWaktuPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");

  const { data: beasiswaRes, isLoading } = useQuery({
    queryKey: ["all-beasiswa"],
    queryFn: () => masterService.getAllBeasiswa(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      masterService.updateTanggalBeasiswa(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: ["all-beasiswa"] });
      }
    },
    onError: () => toast.error("Gagal memperbarui waktu pendaftaran"),
  });

  const handleEdit = (beasiswa: any) => {
    setEditingId(beasiswa.id);
    setMulai(beasiswa.tanggal_mulai ? beasiswa.tanggal_mulai.replace(" ", "T").slice(0, 16) : "");
    setSelesai(beasiswa.tanggal_selesai ? beasiswa.tanggal_selesai.replace(" ", "T").slice(0, 16) : "");
  };

  const handleSave = (id: number) => {
    if (!mulai || !selesai) return toast.error("Harap isi kedua tanggal");
    
    const data = {
      tanggal_mulai: mulai.replace("T", " ") + ":00",
      tanggal_selesai: selesai.replace("T", " ") + ":00",
    };
    mutation.mutate({ id, data });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 2. PERBAIKAN PEMANGGILAN (Tambahkan prop Icon={Calendar}) */}
      <SectionHeader 
        title="Pengaturan Waktu Pendaftaran" 
        subtitle="Kelola jadwal mulai dan berakhirnya pendaftaran beasiswa" 
        Icon={Calendar} 
      />

      <Card className="border-t-4 border-t-primary shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daftar Jadwal Beasiswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nama Beasiswa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu Mulai</TableHead>
                  <TableHead>Waktu Selesai</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beasiswaRes?.data?.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.nama_beasiswa}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.status_aktif === 'Y' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {b.status_aktif === 'Y' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId === b.id ? (
                        <Input type="datetime-local" value={mulai} onChange={(e) => setMulai(e.target.value)} size={1} />
                      ) : (
                        b.tanggal_mulai || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === b.id ? (
                        <Input type="datetime-local" value={selesai} onChange={(e) => setSelesai(e.target.value)} size={1} />
                      ) : (
                        b.tanggal_selesai || "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === b.id ? (
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" onClick={() => handleSave(b.id)} disabled={mutation.isPending}>
                            <Save className="h-4 w-4 mr-1" /> Simpan
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Batal</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(b)}>Atur Waktu</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingWaktuPage;