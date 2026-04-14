import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsKontak, ICmsKontakFormData } from "@/types/master";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Building2,
  Map,
  ChevronDown,
  ChevronRight,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Empty Form ───────────────────────────────────────────────────────────────

const EMPTY_FORM: ICmsKontakFormData = {
  judul_section: "Kontak",
  nama_instansi: "",
  alamat: "",
  telepon: "",
  email: "",
  whatsapp: "",
  jam_operasional: "",
  maps_embed_url: "",
  maps_lat: "",
  maps_lng: "",
  is_active: 1,
};

// ─── Sub-component: Expandable Detail Row ─────────────────────────────────────

interface KontakDetailRowProps {
  kontak: ICmsKontak;
  onEdit: (k: ICmsKontak) => void;
  onDelete: (k: ICmsKontak) => void;
  onToggle: (id: number) => void;
  isToggling: boolean;
}

const KontakDetailRow = ({
  kontak,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}: KontakDetailRowProps) => {
  const [expanded, setExpanded] = useState(false);

  const infoItems = [
    { icon: Building2, label: "Instansi", value: kontak.nama_instansi },
    { icon: MapPin, label: "Alamat", value: kontak.alamat },
    { icon: Phone, label: "Telepon", value: kontak.telepon },
    { icon: Mail, label: "Email", value: kontak.email },
    { icon: MessageCircle, label: "WhatsApp", value: kontak.whatsapp },
    { icon: Clock, label: "Jam Operasional", value: kontak.jam_operasional },
  ].filter((i) => i.value);

  const mapsItems = [
    { label: "Maps Embed URL", value: kontak.maps_embed_url },
    { label: "Latitude", value: kontak.maps_lat },
    { label: "Longitude", value: kontak.maps_lng },
  ].filter((i) => i.value);

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="w-10 pr-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-muted">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </TableCell>

        <TableCell
          onClick={() => setExpanded((v) => !v)}
          className="cursor-pointer">
          <div className="space-y-0.5">
            <p className="font-medium text-sm">{kontak.judul_section}</p>
            {kontak.nama_instansi && (
              <p className="text-xs text-muted-foreground">
                {kontak.nama_instansi}
              </p>
            )}
          </div>
        </TableCell>

        <TableCell className="hidden md:table-cell">
          <div className="space-y-0.5">
            {kontak.telepon && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {kontak.telepon}
              </p>
            )}
            {kontak.email && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {kontak.email}
              </p>
            )}
          </div>
        </TableCell>

        <TableCell className="hidden lg:table-cell">
          {kontak.jam_operasional ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-2">{kontak.jam_operasional}</span>
            </p>
          ) : (
            <span className="text-xs text-muted-foreground italic">—</span>
          )}
        </TableCell>

        <TableCell className="text-center w-28">
          <button
            onClick={() => onToggle(kontak.id)}
            disabled={isToggling}
            className="inline-flex">
            {kontak.is_active === 1 ? (
              <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer text-xs">
                <CheckCircle2 className="h-3 w-3" />
                Aktif
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer text-xs">
                <X className="h-3 w-3" />
                Nonaktif
              </Badge>
            )}
          </button>
        </TableCell>

        <TableCell className="w-24">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(kontak)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(kontak)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded detail */}
      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="py-3 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Info kontak */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Informasi Kontak
                </p>
                {infoItems.length > 0 ? (
                  <div className="space-y-1.5">
                    {infoItems.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex gap-2 text-sm">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            {label}
                          </span>
                          <span className="text-sm whitespace-pre-line">
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ada informasi kontak
                  </p>
                )}
              </div>

              {/* Maps info */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Map className="h-3.5 w-3.5" />
                  Lokasi Maps
                </p>
                {mapsItems.length > 0 ? (
                  <div className="space-y-1.5">
                    {mapsItems.map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-xs font-mono break-all">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ada data lokasi maps
                  </p>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CmsKontakPage = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICmsKontak | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICmsKontak | null>(null);
  const [formData, setFormData] = useState<ICmsKontakFormData>(EMPTY_FORM);

  // ── Query ──
  const {
    data: kontakResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cms-kontak-all"],
    queryFn: () => masterService.getAllCmsKontak(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kontakList: ICmsKontak[] = kontakResponse?.data ?? [];

  // ── Mutations ──
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-kontak-all"] });
    queryClient.invalidateQueries({ queryKey: ["cms-kontak-aktif"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: ICmsKontakFormData) =>
      masterService.createCmsKontak(data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ICmsKontakFormData }) =>
      masterService.updateCmsKontak(id, data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => masterService.deleteCmsKontak(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => masterService.toggleActiveCmsKontak(id),
    onSuccess: () => invalidate(),
  });

  // ── Helpers ──
  const field =
    (key: keyof ICmsKontakFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((p) => ({ ...p, [key]: e.target.value }));

  const openCreate = () => {
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (kontak: ICmsKontak) => {
    setEditTarget(kontak);
    setFormData({
      judul_section: kontak.judul_section,
      nama_instansi: kontak.nama_instansi ?? "",
      alamat: kontak.alamat ?? "",
      telepon: kontak.telepon ?? "",
      email: kontak.email ?? "",
      whatsapp: kontak.whatsapp ?? "",
      jam_operasional: kontak.jam_operasional ?? "",
      maps_embed_url: kontak.maps_embed_url ?? "",
      maps_lat: kontak.maps_lat ?? "",
      maps_lng: kontak.maps_lng ?? "",
      is_active: kontak.is_active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = () => {
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
            Manajemen CMS Kontak
          </CardTitle>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Kontak
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Kelola informasi kontak yang ditampilkan di landing page. Hanya satu
            kontak yang dapat aktif pada satu waktu.
          </p>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Memuat data kontak...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Gagal memuat data. Coba lagi.</span>
            </div>
          ) : kontakList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Phone className="h-10 w-10 opacity-30" />
              <span className="text-sm">Belum ada data kontak.</span>
              <Button variant="outline" size="sm" onClick={openCreate}>
                Tambah Kontak Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Judul & Instansi</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Telepon / Email
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Jam Operasional
                  </TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kontakList.map((kontak) => (
                  <KontakDetailRow
                    key={kontak.id}
                    kontak={kontak}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    onToggle={(id) => toggleMutation.mutate(id)}
                    isToggling={toggleMutation.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Form Dialog ── */}
      <Dialog open={isFormOpen} onOpenChange={(v) => !v && closeForm()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto font-inter">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Data Kontak" : "Tambah Kontak Baru"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="umum" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="umum" className="flex-1">
                Informasi Umum
              </TabsTrigger>
              <TabsTrigger value="kontak" className="flex-1">
                Detail Kontak
              </TabsTrigger>
              <TabsTrigger value="maps" className="flex-1">
                Lokasi Maps
              </TabsTrigger>
            </TabsList>

            {/* Tab: Informasi Umum */}
            <TabsContent value="umum" className="space-y-4 mt-0">
              <div className="space-y-1.5">
                <Label htmlFor="judul_section">Judul Section</Label>
                <Input
                  id="judul_section"
                  placeholder="Kontak"
                  value={formData.judul_section}
                  onChange={field("judul_section")}
                />
                <p className="text-xs text-muted-foreground">
                  Judul yang ditampilkan di bagian kontak pada landing page.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nama_instansi">Nama Instansi</Label>
                <Input
                  id="nama_instansi"
                  placeholder="Contoh: BPDP Kelapa Sawit"
                  value={formData.nama_instansi ?? ""}
                  onChange={field("nama_instansi")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  placeholder="Jl. HR Rasuna Said Kav. C5, Jakarta Selatan"
                  rows={3}
                  value={formData.alamat ?? ""}
                  onChange={field("alamat")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jam_operasional">Jam Operasional</Label>
                <Textarea
                  id="jam_operasional"
                  placeholder="Senin – Jumat: 08.00 – 16.00 WIB"
                  rows={2}
                  value={formData.jam_operasional ?? ""}
                  onChange={field("jam_operasional")}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Jadikan Aktif</Label>
                  <p className="text-xs text-muted-foreground">
                    Hanya satu kontak yang aktif. Kontak lain otomatis
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
            </TabsContent>

            {/* Tab: Detail Kontak */}
            <TabsContent value="kontak" className="space-y-4 mt-0">
              <div className="space-y-1.5">
                <Label htmlFor="telepon" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Telepon
                </Label>
                <Input
                  id="telepon"
                  placeholder="+62 21 1234 5678"
                  value={formData.telepon ?? ""}
                  onChange={field("telepon")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@instansi.go.id"
                  value={formData.email ?? ""}
                  onChange={field("email")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="628123456789 (tanpa + atau spasi)"
                  value={formData.whatsapp ?? ""}
                  onChange={field("whatsapp")}
                />
                <p className="text-xs text-muted-foreground">
                  Format nomor internasional tanpa tanda +, misal: 6281234567890
                </p>
              </div>
            </TabsContent>

            {/* Tab: Lokasi Maps */}
            <TabsContent value="maps" className="space-y-4 mt-0">
              <div className="space-y-1.5">
                <Label
                  htmlFor="maps_embed_url"
                  className="flex items-center gap-1.5">
                  <Map className="h-3.5 w-3.5 text-muted-foreground" />
                  Maps Embed URL
                </Label>
                <Textarea
                  id="maps_embed_url"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  rows={3}
                  value={formData.maps_embed_url ?? ""}
                  onChange={field("maps_embed_url")}
                />
                <p className="text-xs text-muted-foreground">
                  URL dari Google Maps → Share → Embed a map → salin src iframe.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="maps_lat">Latitude</Label>
                  <Input
                    id="maps_lat"
                    placeholder="-6.2088"
                    value={formData.maps_lat ?? ""}
                    onChange={field("maps_lat")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maps_lng">Longitude</Label>
                  <Input
                    id="maps_lng"
                    placeholder="106.8456"
                    value={formData.maps_lng ?? ""}
                    onChange={field("maps_lng")}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground rounded-lg border border-dashed p-3">
                💡 Koordinat opsional — digunakan jika aplikasi perlu
                menampilkan pin atau menghitung jarak. Temukan di Google Maps →
                klik kanan pada titik lokasi → salin koordinat.
              </p>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button variant="outline" onClick={closeForm} disabled={isMutating}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isMutating}
              className="gap-2">
              {isMutating && <Loader2 className="h-4 w-4 animate-spin" />}
              {editTarget ? "Simpan Perubahan" : "Tambah Kontak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="font-inter">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kontak?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu akan menghapus kontak{" "}
              <span className="font-semibold text-foreground">
                "{deleteTarget?.judul_section}"
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

export default CmsKontakPage;
