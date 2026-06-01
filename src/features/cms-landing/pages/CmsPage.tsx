/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsHero, ICmsHeroFormData } from "@/types/master";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Empty Form State ──────────────────────────────────────────────────────────

const EMPTY_FORM: ICmsHeroFormData = {
  judul: "",
  subjudul: "",
  bg_image_url: "",
  label_cta: "Daftar Sekarang",
  url_cta: "/daftar-penerima-beasiswa",
  label_cta_2: "",
  url_cta_2: "",
  
  // Slide 2
  bg_image_url_2: "",
  judul_2: "",
  subjudul_2: "",
  s2_label_cta: "",
  s2_url_cta: "",
  s2_label_cta_2: "",
  s2_url_cta_2: "",

  // Slide 3
  bg_image_url_3: "",
  judul_3: "",
  subjudul_3: "",
  s3_label_cta: "",
  s3_url_cta: "",
  s3_label_cta_2: "",
  s3_url_cta_2: "",

  is_active: 0,
};

// ─── Component ────────────────────────────────────────────────────────────────

const CmsHeroPage = () => {
  const queryClient = useQueryClient();

  // ── Local state ──
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICmsHero | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICmsHero | null>(null);
  const [formData, setFormData] = useState<ICmsHeroFormData>(EMPTY_FORM);

  // State file untuk gambar slider
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);

  // ── Query: ambil semua hero ──
  const {
    data: heroResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cms-hero-all"],
    queryFn: () => masterService.getAllCmsHero(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const heroList: ICmsHero[] = heroResponse?.data ?? [];

  // ── Mutations ──
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["cms-hero-all"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => masterService.createCmsHero(data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      masterService.updateCmsHero(id, data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => masterService.deleteCmsHero(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => masterService.toggleActiveCmsHero(id),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["cms-hero-aktif"] });
    },
  });

  // ── Handlers ──
  const openCreate = () => {
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (hero: ICmsHero) => {
    setEditTarget(hero);
    setFormData({
      judul: hero.judul,
      subjudul: hero.subjudul ?? "",
      bg_image_url: hero.bg_image_url ?? "",
      label_cta: hero.label_cta ?? "",
      url_cta: hero.url_cta ?? "",
      label_cta_2: hero.label_cta_2 ?? "",
      url_cta_2: hero.url_cta_2 ?? "",

      // Set value Slide 2
      bg_image_url_2: hero.bg_image_url_2 ?? "",
      judul_2: hero.judul_2 ?? "",
      subjudul_2: hero.subjudul_2 ?? "",
      s2_label_cta: hero.s2_label_cta ?? "",
      s2_url_cta: hero.s2_url_cta ?? "",
      s2_label_cta_2: hero.s2_label_cta_2 ?? "",
      s2_url_cta_2: hero.s2_url_cta_2 ?? "",

      // Set value Slide 3
      bg_image_url_3: hero.bg_image_url_3 ?? "",
      judul_3: hero.judul_3 ?? "",
      subjudul_3: hero.subjudul_3 ?? "",
      s3_label_cta: hero.s3_label_cta ?? "",
      s3_url_cta: hero.s3_url_cta ?? "",
      s3_label_cta_2: hero.s3_label_cta_2 ?? "",
      s3_url_cta_2: hero.s3_url_cta_2 ?? "",

      is_active: hero.is_active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setFile1(null);
    setFile2(null);
    setFile3(null);
  };

  const handleSubmit = () => {
    if (!formData.judul.trim()) return;

    const fd = new FormData();
    
    // Append data text secara dinamis agar ringkas
    const keys = Object.keys(formData) as (keyof ICmsHeroFormData)[];
    keys.forEach((key) => {
      if (!["bg_image_url", "bg_image_url_2", "bg_image_url_3"].includes(key)) {
        if (formData[key] !== undefined && formData[key] !== null) {
          fd.append(key, String(formData[key]));
        }
      }
    });

    // Append file gambar
    if (file1) fd.append("bg_image_url", file1);
    else if (formData.bg_image_url) fd.append("bg_image_url", formData.bg_image_url);

    if (file2) fd.append("bg_image_url_2", file2);
    else if (formData.bg_image_url_2) fd.append("bg_image_url_2", formData.bg_image_url_2);

    if (file3) fd.append("bg_image_url_3", file3);
    else if (formData.bg_image_url_3) fd.append("bg_image_url_3", formData.bg_image_url_3);

    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto w-full space-y-6 py-6">
      {/* ── Header ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">
            Manajemen CMS Hero
          </CardTitle>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Hero
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Kelola konten hero section pada landing page (Multiple Slide). Hanya satu hero yang
            dapat aktif pada satu waktu.
          </p>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Memuat data hero...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Gagal memuat data. Coba lagi.</span>
            </div>
          ) : heroList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-30" />
              <span className="text-sm">Belum ada data hero.</span>
              <Button variant="outline" size="sm" onClick={openCreate}>
                Tambah Hero Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Judul Utama</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Sub-judul
                  </TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="w-32 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {heroList.map((hero, idx) => (
                  <TableRow key={hero.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm leading-snug">
                          {hero.judul}
                        </p>
                        <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                          {hero.bg_image_url && <a href={hero.bg_image_url} target="_blank" className="truncate max-w-[180px] hover:underline text-blue-500">1️⃣ Slide 1 Aktif</a>}
                          {hero.bg_image_url_2 && <a href={hero.bg_image_url_2} target="_blank" className="truncate max-w-[180px] hover:underline text-blue-500">2️⃣ Slide 2 Aktif</a>}
                          {hero.bg_image_url_3 && <a href={hero.bg_image_url_3} target="_blank" className="truncate max-w-[180px] hover:underline text-blue-500">3️⃣ Slide 3 Aktif</a>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[300px] truncate">
                      {hero.subjudul ?? (
                        <span className="italic opacity-40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleMutation.mutate(hero.id)}
                        disabled={toggleMutation.isPending}
                        className="inline-flex items-center justify-center"
                        title={hero.is_active ? "Nonaktifkan" : "Aktifkan"}>
                        {hero.is_active === 1 ? (
                          <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer">
                            <CheckCircle2 className="h-3 w-3" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="gap-1 cursor-pointer">
                            <X className="h-3 w-3" />
                            Nonaktif
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(hero)}
                          title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(hero)}
                          title="Hapus">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Form Dialog (Create / Edit) ── */}
      <Dialog open={isFormOpen} onOpenChange={(v) => !v && closeForm()}>
        <DialogContent className="sm:max-w-2xl font-inter max-h-[90vh] overflow-y-auto bg-slate-50">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Data Hero" : "Tambah Hero Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            
            {/* ── SLIDE 1 (UTAMA) ── */}
            <div className="bg-white p-4 border rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">🖼️ Slide 1 (Utama)</h3>
              <div className="space-y-1.5">
                <Label>Gambar Background <span className="text-destructive">*</span></Label>
                <div className="flex items-center gap-3">
                  <Input type="file" accept="image/*" onChange={(e) => setFile1(e.target.files?.[0] || null)} />
                  {(file1 || formData.bg_image_url) && (
                    <img src={file1 ? URL.createObjectURL(file1) : (formData.bg_image_url ?? undefined)} className="h-10 w-10 object-cover rounded border" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="judul">Judul <span className="text-destructive">*</span></Label>
                <Input id="judul" placeholder="Contoh: BEASISWA SDM SAWIT" value={formData.judul} onChange={(e) => setFormData((p) => ({ ...p, judul: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subjudul">Sub-judul</Label>
                <Textarea id="subjudul" rows={2} value={formData.subjudul ?? ""} onChange={(e) => setFormData((p) => ({ ...p, subjudul: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-lg">
                <div className="space-y-1.5"><Label className="text-xs">Tombol 1 (Label)</Label><Input placeholder="Daftar Sekarang" value={formData.label_cta ?? ""} onChange={(e) => setFormData((p) => ({ ...p, label_cta: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 1 (URL)</Label><Input placeholder="/daftar" value={formData.url_cta ?? ""} onChange={(e) => setFormData((p) => ({ ...p, url_cta: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 2 (Label)</Label><Input placeholder="Download Panduan" value={formData.label_cta_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, label_cta_2: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 2 (URL)</Label><Input placeholder="https://link-panduan.pdf" value={formData.url_cta_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, url_cta_2: e.target.value }))} /></div>
              </div>
            </div>

            {/* ── SLIDE 2 (OPSIONAL) ── */}
            <div className="bg-white p-4 border rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">🖼️ Slide 2 (Opsional)</h3>
              <div className="space-y-1.5">
                <Label>Gambar Background</Label>
                <div className="flex items-center gap-3">
                  <Input type="file" accept="image/*" onChange={(e) => setFile2(e.target.files?.[0] || null)} />
                  {(file2 || formData.bg_image_url_2) && (
                    <img src={file2 ? URL.createObjectURL(file2) : (formData.bg_image_url_2 ?? undefined)} className="h-10 w-10 object-cover rounded border" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Judul (Slide 2)</Label>
                <Input value={formData.judul_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, judul_2: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Sub-judul (Slide 2)</Label>
                <Textarea rows={2} value={formData.subjudul_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, subjudul_2: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-lg">
                <div className="space-y-1.5"><Label className="text-xs">Tombol 1 (Label)</Label><Input value={formData.s2_label_cta ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s2_label_cta: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 1 (URL)</Label><Input value={formData.s2_url_cta ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s2_url_cta: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 2 (Label)</Label><Input value={formData.s2_label_cta_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s2_label_cta_2: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 2 (URL)</Label><Input value={formData.s2_url_cta_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s2_url_cta_2: e.target.value }))} /></div>
              </div>
            </div>

            {/* ── SLIDE 3 (OPSIONAL) ── */}
            <div className="bg-white p-4 border rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">🖼️ Slide 3 (Opsional)</h3>
              <div className="space-y-1.5">
                <Label>Gambar Background</Label>
                <div className="flex items-center gap-3">
                  <Input type="file" accept="image/*" onChange={(e) => setFile3(e.target.files?.[0] || null)} />
                  {(file3 || formData.bg_image_url_3) && (
                    <img src={file3 ? URL.createObjectURL(file3) : (formData.bg_image_url_3 ?? undefined)} className="h-10 w-10 object-cover rounded border" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Judul (Slide 3)</Label>
                <Input value={formData.judul_3 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, judul_3: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Sub-judul (Slide 3)</Label>
                <Textarea rows={2} value={formData.subjudul_3 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, subjudul_3: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-lg">
                <div className="space-y-1.5"><Label className="text-xs">Tombol 1 (Label)</Label><Input value={formData.s3_label_cta ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s3_label_cta: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 1 (URL)</Label><Input value={formData.s3_url_cta ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s3_url_cta: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 2 (Label)</Label><Input value={formData.s3_label_cta_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s3_label_cta_2: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Tombol 2 (URL)</Label><Input value={formData.s3_url_cta_2 ?? ""} onChange={(e) => setFormData((p) => ({ ...p, s3_url_cta_2: e.target.value }))} /></div>
              </div>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center justify-between rounded-lg bg-white border p-4 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Jadikan Aktif</Label>
                <p className="text-xs text-muted-foreground">
                  Hanya satu set hero yang aktif dalam satu waktu.
                </p>
              </div>
              <Switch
                checked={formData.is_active === 1}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, is_active: checked ? 1 : 0 }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={closeForm} disabled={isMutating}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isMutating || !formData.judul.trim()}
              className="gap-2">
              {isMutating && <Loader2 className="h-4 w-4 animate-spin" />}
              {editTarget ? "Simpan Perubahan" : "Tambah Hero"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="font-inter">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Hero?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu akan menghapus hero{" "}
              <span className="font-semibold text-foreground">
                "{deleteTarget?.judul}"
              </span>
              . Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }>
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CmsHeroPage;