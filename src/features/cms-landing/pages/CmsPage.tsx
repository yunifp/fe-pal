import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsHero, ICmsHeroFormData } from "@/types/master";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
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
    mutationFn: (data: ICmsHeroFormData) => masterService.createCmsHero(data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ICmsHeroFormData }) =>
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
      label_cta: hero.label_cta ?? "Daftar Sekarang",
      url_cta: hero.url_cta ?? "/daftar-penerima-beasiswa",
      is_active: hero.is_active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = () => {
    if (!formData.judul.trim()) return;
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: formData });
    } else {
      createMutation.mutate(formData);
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
            Kelola konten hero section pada landing page. Hanya satu hero yang
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
                  <TableHead>Judul</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Sub-judul
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Label CTA
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    URL CTA
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
                        {hero.bg_image_url && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            🖼 {hero.bg_image_url}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {hero.subjudul ?? (
                        <span className="italic opacity-40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {hero.label_cta ?? (
                        <span className="italic opacity-40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[160px]">
                      {hero.url_cta ?? (
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
        <DialogContent className="sm:max-w-lg font-inter">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Data Hero" : "Tambah Hero Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Judul */}
            <div className="space-y-1.5">
              <Label htmlFor="judul">
                Judul <span className="text-destructive">*</span>
              </Label>
              <Input
                id="judul"
                placeholder="Contoh: BEASISWA SDM SAWIT"
                value={formData.judul}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, judul: e.target.value }))
                }
              />
            </div>

            {/* Sub-judul */}
            <div className="space-y-1.5">
              <Label htmlFor="subjudul">Sub-judul</Label>
              <Textarea
                id="subjudul"
                placeholder="Deskripsi singkat hero section..."
                rows={2}
                value={formData.subjudul ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, subjudul: e.target.value }))
                }
              />
            </div>

            {/* Background Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="bg_image_url">URL Gambar Background</Label>
              <Input
                id="bg_image_url"
                placeholder="/images/bg_beasiswa.png atau https://..."
                value={formData.bg_image_url ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, bg_image_url: e.target.value }))
                }
              />
            </div>

            {/* Label CTA & URL CTA — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="label_cta">Label Tombol CTA</Label>
                <Input
                  id="label_cta"
                  placeholder="Daftar Sekarang"
                  value={formData.label_cta ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, label_cta: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url_cta">URL Tombol CTA</Label>
                <Input
                  id="url_cta"
                  placeholder="/daftar-penerima-beasiswa"
                  value={formData.url_cta ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, url_cta: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Jadikan Aktif</Label>
                <p className="text-xs text-muted-foreground">
                  Hanya satu hero yang aktif. Hero lain akan otomatis
                  dinonaktifkan.
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

          <DialogFooter className="gap-2">
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
