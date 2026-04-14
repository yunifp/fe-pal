import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsJalurPendaftaran, ICmsJalurFormData } from "@/types/master";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  X,
  GripVertical,
  FileText,
  ClipboardList,
  Search,
  ImageIcon,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemRow {
  text: string;
  urutan: number;
}

// ─── Empty States ─────────────────────────────────────────────────────────────

const EMPTY_FORM: ICmsJalurFormData = {
  judul: "",
  deskripsi: "",
  gambar_url: "",
  urutan: 0,
  is_active: 1,
  syarat: [],
  dokumen: [],
};

// ─── Sub-component: Item List Editor (untuk syarat / dokumen) ─────────────────

interface ItemListEditorProps {
  label: string;
  placeholder: string;
  items: ItemRow[];
  onChange: (items: ItemRow[]) => void;
}

const ItemListEditor = ({
  label,
  placeholder,
  items,
  onChange,
}: ItemListEditorProps) => {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, { text: trimmed, urutan: items.length + 1 }]);
    setDraft("");
  };

  const removeItem = (idx: number) => {
    const next = items
      .filter((_, i) => i !== idx)
      .map((it, i) => ({ ...it, urutan: i + 1 }));
    onChange(next);
  };

  const updateItem = (idx: number, value: string) => {
    const next = items.map((it, i) =>
      i === idx ? { ...it, text: value } : it,
    );
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Existing items */}
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
              <span className="text-xs text-muted-foreground w-5 flex-shrink-0">
                {idx + 1}.
              </span>
              <Input
                value={item.text}
                onChange={(e) => updateItem(idx, e.target.value)}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeItem(idx)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={draft}
          className="h-8 text-sm"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-shrink-0 gap-1"
          onClick={addItem}
          disabled={!draft.trim()}>
          <Plus className="h-3.5 w-3.5" />
          Tambah
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Belum ada {label.toLowerCase()}. Ketik lalu tekan Enter atau klik
          Tambah.
        </p>
      )}
    </div>
  );
};

// ─── Sub-component: Expandable Row Detail ─────────────────────────────────────

interface JalurDetailRowProps {
  jalur: ICmsJalurPendaftaran;
  onEdit: (jalur: ICmsJalurPendaftaran) => void;
  onDelete: (jalur: ICmsJalurPendaftaran) => void;
  onToggle: (id: number) => void;
  isToggling: boolean;
}

const JalurDetailRow = ({
  jalur,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}: JalurDetailRowProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50">
        {/* Expand toggle */}
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

        <TableCell className="w-12 text-center text-muted-foreground text-sm font-mono">
          {jalur.urutan}
        </TableCell>

        <TableCell onClick={() => setExpanded((v) => !v)}>
          <div className="space-y-0.5">
            <p className="font-medium text-sm">{jalur.judul}</p>
            {jalur.deskripsi && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {jalur.deskripsi}
              </p>
            )}
          </div>
        </TableCell>

        <TableCell className="hidden md:table-cell text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              {jalur.syarat.length} syarat
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              {jalur.dokumen.length} dokumen
            </span>
          </div>
        </TableCell>

        <TableCell className="text-center w-28">
          <button
            onClick={() => onToggle(jalur.id)}
            disabled={isToggling}
            className="inline-flex">
            {jalur.is_active === 1 ? (
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
              onClick={() => onEdit(jalur)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(jalur)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded detail row */}
      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="py-3 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Syarat */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Persyaratan
                </p>
                {jalur.syarat.length > 0 ? (
                  <ol className="space-y-1">
                    {jalur.syarat.map((s) => (
                      <li key={s.id} className="text-sm flex gap-2">
                        <span className="text-muted-foreground text-xs w-4 flex-shrink-0 mt-0.5">
                          {s.urutan}.
                        </span>
                        {s.syarat}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ada syarat
                  </p>
                )}
              </div>

              {/* Dokumen */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Dokumen Diperlukan
                </p>
                {jalur.dokumen.length > 0 ? (
                  <ol className="space-y-1">
                    {jalur.dokumen.map((d) => (
                      <li key={d.id} className="text-sm flex gap-2">
                        <span className="text-muted-foreground text-xs w-4 flex-shrink-0 mt-0.5">
                          {d.urutan}.
                        </span>
                        {d.dokumen}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ada dokumen
                  </p>
                )}
              </div>

              {/* Gambar URL jika ada */}
              {jalur.gambar_url && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-1">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Gambar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {jalur.gambar_url}
                  </p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const JalurPendaftaranPage = () => {
  const queryClient = useQueryClient();

  // ── State ──
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICmsJalurPendaftaran | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<ICmsJalurPendaftaran | null>(
    null,
  );
  const [formData, setFormData] = useState<ICmsJalurFormData>(EMPTY_FORM);

  // Local item arrays for the form (convert from/to ICmsJalurFormData)
  const [syaratItems, setSyaratItems] = useState<ItemRow[]>([]);
  const [dokumenItems, setDokumenItems] = useState<ItemRow[]>([]);

  // ── Query ──
  const {
    data: jalurResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cms-jalur-all", search],
    queryFn: () => masterService.getAllCmsJalur(search || undefined),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jalurList: ICmsJalurPendaftaran[] = jalurResponse?.data ?? [];

  // ── Mutations ──
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-jalur-all"] });
    queryClient.invalidateQueries({ queryKey: ["cms-jalur-aktif"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: ICmsJalurFormData) => masterService.createCmsJalur(data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ICmsJalurFormData }) =>
      masterService.updateCmsJalur(id, data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => masterService.deleteCmsJalur(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => masterService.toggleActiveCmsJalur(id),
    onSuccess: () => invalidate(),
  });

  // ── Helpers ──
  const openCreate = () => {
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setSyaratItems([]);
    setDokumenItems([]);
    setIsFormOpen(true);
  };

  const openEdit = (jalur: ICmsJalurPendaftaran) => {
    setEditTarget(jalur);
    setFormData({
      judul: jalur.judul,
      deskripsi: jalur.deskripsi ?? "",
      gambar_url: jalur.gambar_url ?? "",
      urutan: jalur.urutan,
      is_active: jalur.is_active,
    });
    setSyaratItems(
      jalur.syarat.map((s) => ({ text: s.syarat, urutan: s.urutan })),
    );
    setDokumenItems(
      jalur.dokumen.map((d) => ({ text: d.dokumen, urutan: d.urutan })),
    );
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setSyaratItems([]);
    setDokumenItems([]);
  };

  const handleSubmit = () => {
    if (!formData.judul.trim()) return;

    const payload: ICmsJalurFormData = {
      ...formData,
      syarat: syaratItems.map((s, i) => ({ syarat: s.text, urutan: i + 1 })),
      dokumen: dokumenItems.map((d, i) => ({ dokumen: d.text, urutan: i + 1 })),
    };

    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: payload });
    } else {
      createMutation.mutate(payload);
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
            Manajemen Jalur Pendaftaran
          </CardTitle>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Jalur
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Kelola jalur pendaftaran beasiswa beserta syarat dan dokumen yang
            diperlukan pada masing-masing jalur.
          </p>
        </CardContent>
      </Card>

      {/* ── Search + Table ── */}
      <Card>
        <CardContent className="pt-4 px-4 pb-0">
          {/* Search */}
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari jalur pendaftaran..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Memuat data jalur...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Gagal memuat data. Coba lagi.</span>
            </div>
          ) : jalurList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <FolderOpen className="h-10 w-10 opacity-30" />
              <span className="text-sm">
                {search
                  ? `Tidak ada hasil untuk "${search}"`
                  : "Belum ada jalur pendaftaran."}
              </span>
              {!search && (
                <Button variant="outline" size="sm" onClick={openCreate}>
                  Tambah Jalur Pertama
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-12 text-center">Urutan</TableHead>
                  <TableHead>Judul & Deskripsi</TableHead>
                  <TableHead className="hidden md:table-cell text-center">
                    Konten
                  </TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jalurList.map((jalur) => (
                  <JalurDetailRow
                    key={jalur.id}
                    jalur={jalur}
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
              {editTarget ? "Edit Jalur Pendaftaran" : "Tambah Jalur Baru"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="info" className="flex-1">
                Informasi Jalur
              </TabsTrigger>
              <TabsTrigger value="syarat" className="flex-1">
                Persyaratan
                {syaratItems.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-xs h-4 px-1">
                    {syaratItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="dokumen" className="flex-1">
                Dokumen
                {dokumenItems.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-xs h-4 px-1">
                    {dokumenItems.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab: Info */}
            <TabsContent value="info" className="space-y-4 mt-0">
              <div className="space-y-1.5">
                <Label htmlFor="judul">
                  Judul <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="judul"
                  placeholder="Contoh: Jalur Reguler"
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, judul: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Deskripsi singkat jalur pendaftaran ini..."
                  rows={3}
                  value={formData.deskripsi ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, deskripsi: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gambar_url">URL Gambar</Label>
                  <Input
                    id="gambar_url"
                    placeholder="/images/jalur.png"
                    value={formData.gambar_url ?? ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, gambar_url: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="urutan">Urutan Tampil</Label>
                  <Input
                    id="urutan"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.urutan ?? 0}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        urutan: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Status Aktif</Label>
                  <p className="text-xs text-muted-foreground">
                    Jalur nonaktif tidak ditampilkan di landing page.
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

            {/* Tab: Syarat */}
            <TabsContent value="syarat" className="mt-0">
              <div className="rounded-lg border p-4">
                <ItemListEditor
                  label="Daftar Persyaratan"
                  placeholder="Contoh: Mahasiswa aktif S1/D4"
                  items={syaratItems}
                  onChange={setSyaratItems}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Saat menyimpan, seluruh syarat lama akan diganti dengan daftar
                ini.
              </p>
            </TabsContent>

            {/* Tab: Dokumen */}
            <TabsContent value="dokumen" className="mt-0">
              <div className="rounded-lg border p-4">
                <ItemListEditor
                  label="Daftar Dokumen"
                  placeholder="Contoh: Scan KTP / KTM"
                  items={dokumenItems}
                  onChange={setDokumenItems}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Saat menyimpan, seluruh dokumen lama akan diganti dengan daftar
                ini.
              </p>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button variant="outline" onClick={closeForm} disabled={isMutating}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isMutating || !formData.judul.trim()}
              className="gap-2">
              {isMutating && <Loader2 className="h-4 w-4 animate-spin" />}
              {editTarget ? "Simpan Perubahan" : "Tambah Jalur"}
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
            <AlertDialogTitle>Hapus Jalur Pendaftaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu akan menghapus jalur{" "}
              <span className="font-semibold text-foreground">
                "{deleteTarget?.judul}"
              </span>{" "}
              beserta seluruh syarat dan dokumen di dalamnya. Tindakan ini tidak
              dapat dibatalkan.
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

export default JalurPendaftaranPage;
