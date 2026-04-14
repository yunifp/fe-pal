import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ICmsTentang, ICmsTentangFormData } from "@/types/master";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  BookOpen,
  ImageIcon,
  Eye,
  Code2,
  ChevronRight,
  Sparkles,
  FileText,
  Settings2,
  LayoutTemplate,
  RefreshCw,
  Info,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Unlink,
  Minus,
  Undo,
  Redo,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
@keyframes rte-fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rte-slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rte-badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
  50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
}
.rte-fade-in    { animation: rte-fadeIn 0.28s ease both; }
.rte-slide-down { animation: rte-slideDown 0.22s ease both; }
.rte-badge-pulse{ animation: rte-badgePulse 2s ease-in-out infinite; }
.rte-expand-icon{ transition: transform 0.2s ease; }
.rte-btn-scale  { transition: transform 0.15s ease; }
.rte-btn-scale:hover { transform: scale(1.13); }

/* Toolbar button */
.rte-tb-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 6px;
  color: hsl(var(--muted-foreground));
  transition: background 0.12s, color 0.12s, transform 0.1s;
  cursor: pointer; flex-shrink: 0; border: none; background: transparent;
}
.rte-tb-btn:hover  { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.rte-tb-btn.active { background: hsl(var(--primary) / 0.12); color: hsl(var(--primary)); }
.rte-tb-btn:active { transform: scale(0.88); }
.rte-tb-divider    { width:1px; height:18px; background:hsl(var(--border)); margin:0 3px; flex-shrink:0; }

/* Editable area */
.rte-editable {
  min-height: 220px; max-height: 480px; overflow-y: auto;
  outline: none; font-size: 0.875rem; line-height: 1.7;
  color: hsl(var(--foreground));
  padding: 14px 16px;
  caret-color: hsl(var(--primary));
}
.rte-editable p   { margin: 0 0 0.55em; }
.rte-editable h2  { font-size: 1.2em; font-weight: 700; margin: 0.9em 0 0.4em; line-height: 1.3; }
.rte-editable h3  { font-size: 1.05em; font-weight: 600; margin: 0.75em 0 0.35em; line-height: 1.35; }
.rte-editable ul  { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
.rte-editable ol  { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
.rte-editable li  { margin-bottom: 0.15em; }
.rte-editable a   { color: hsl(var(--primary)); text-decoration: underline; }
.rte-editable hr  { border: none; border-top: 1px solid hsl(var(--border)); margin: 0.9em 0; }
.rte-editable b, .rte-editable strong { font-weight: 700; }
.rte-editable:empty::before {
  content: attr(data-placeholder);
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}
`;

// ─── Empty Form ───────────────────────────────────────────────────────────────

const EMPTY_FORM: ICmsTentangFormData = {
  judul_section: "Tentang Beasiswa",
  deskripsi: "",
  gambar_url: "",
  is_active: 1,
};

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Tulis deskripsi di sini...",
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [rawHtml, setRawHtml] = useState(value);
  const [, forceUpdate] = useState(0); // for toolbar active state re-render

  // Populate editor on mount
  useEffect(() => {
    if (editorRef.current && mode === "visual") {
      editorRef.current.innerHTML = rawHtml;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync rawHtml → contentEditable when switching back to visual
  const switchMode = (next: "visual" | "html") => {
    if (next === "visual" && editorRef.current) {
      editorRef.current.innerHTML = rawHtml;
    }
    setMode(next);
  };

  const exec = useCallback(
    (cmd: string, arg?: string) => {
      document.execCommand(cmd, false, arg ?? undefined);
      editorRef.current?.focus();
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        setRawHtml(html);
        onChange(html);
      }
      forceUpdate((n) => n + 1);
    },
    [onChange],
  );

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setRawHtml(html);
    onChange(html);
  };

  const handleHtmlChange = (v: string) => {
    setRawHtml(v);
    onChange(v);
  };

  const handleLinkInsert = () => {
    const url = window.prompt("Masukkan URL tautan:");
    if (url) exec("createLink", url);
  };

  const isCmd = (cmd: string) => {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  };

  // Toolbar definition
  type TbItem =
    | {
        kind: "btn";
        cmd: string;
        arg?: string;
        icon: React.ReactNode;
        title: string;
        special?: string;
      }
    | { kind: "div" };

  const TOOLBAR: TbItem[][] = [
    [
      {
        kind: "btn",
        cmd: "undo",
        icon: <Undo className="h-3.5 w-3.5" />,
        title: "Undo",
      },
      {
        kind: "btn",
        cmd: "redo",
        icon: <Redo className="h-3.5 w-3.5" />,
        title: "Redo",
      },
    ],
    [{ kind: "div" }],
    [
      {
        kind: "btn",
        cmd: "formatBlock",
        arg: "h2",
        icon: <Heading2 className="h-3.5 w-3.5" />,
        title: "Heading 2",
      },
      {
        kind: "btn",
        cmd: "formatBlock",
        arg: "h3",
        icon: <Heading3 className="h-3.5 w-3.5" />,
        title: "Heading 3",
      },
      {
        kind: "btn",
        cmd: "formatBlock",
        arg: "p",
        icon: <Type className="h-3.5 w-3.5" />,
        title: "Paragraf",
      },
    ],
    [{ kind: "div" }],
    [
      {
        kind: "btn",
        cmd: "bold",
        icon: <Bold className="h-3.5 w-3.5" />,
        title: "Bold (Ctrl+B)",
      },
      {
        kind: "btn",
        cmd: "italic",
        icon: <Italic className="h-3.5 w-3.5" />,
        title: "Italic (Ctrl+I)",
      },
      {
        kind: "btn",
        cmd: "underline",
        icon: <Underline className="h-3.5 w-3.5" />,
        title: "Underline (Ctrl+U)",
      },
      {
        kind: "btn",
        cmd: "strikeThrough",
        icon: <Strikethrough className="h-3.5 w-3.5" />,
        title: "Strikethrough",
      },
    ],
    [{ kind: "div" }],
    [
      {
        kind: "btn",
        cmd: "insertUnorderedList",
        icon: <List className="h-3.5 w-3.5" />,
        title: "Bullet List",
      },
      {
        kind: "btn",
        cmd: "insertOrderedList",
        icon: <ListOrdered className="h-3.5 w-3.5" />,
        title: "Numbered List",
      },
    ],
    [{ kind: "div" }],
    [
      {
        kind: "btn",
        cmd: "justifyLeft",
        icon: <AlignLeft className="h-3.5 w-3.5" />,
        title: "Rata Kiri",
      },
      {
        kind: "btn",
        cmd: "justifyCenter",
        icon: <AlignCenter className="h-3.5 w-3.5" />,
        title: "Rata Tengah",
      },
      {
        kind: "btn",
        cmd: "justifyRight",
        icon: <AlignRight className="h-3.5 w-3.5" />,
        title: "Rata Kanan",
      },
    ],
    [{ kind: "div" }],
    [
      {
        kind: "btn",
        cmd: "createLink",
        icon: <Link className="h-3.5 w-3.5" />,
        title: "Tambah Link",
        special: "link",
      },
      {
        kind: "btn",
        cmd: "unlink",
        icon: <Unlink className="h-3.5 w-3.5" />,
        title: "Hapus Link",
      },
      {
        kind: "btn",
        cmd: "insertHorizontalRule",
        icon: <Minus className="h-3.5 w-3.5" />,
        title: "Garis Pemisah",
      },
    ],
  ];

  const plainLen = rawHtml
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim().length;

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          Deskripsi
        </Label>
        <div className="flex items-center gap-0.5 rounded-full border bg-muted/40 p-0.5">
          {(["visual", "html"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                mode === m
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {m === "visual" ? (
                <>
                  <Eye className="h-3 w-3" />
                  Visual
                </>
              ) : (
                <>
                  <Code2 className="h-3 w-3" />
                  HTML
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Editor box */}
      <div
        className={`rounded-xl border bg-background shadow-sm overflow-hidden rte-fade-in`}
        key={mode}>
        {mode === "visual" ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30 sticky top-0 z-10">
              {TOOLBAR.map((group, gi) =>
                group.map((item, ii) => {
                  if (item.kind === "div")
                    return (
                      <div key={`d${gi}${ii}`} className="rte-tb-divider" />
                    );
                  const active = isCmd(item.cmd);
                  return (
                    <button
                      key={`${item.cmd}${item.arg ?? ""}`}
                      type="button"
                      title={item.title}
                      className={`rte-tb-btn ${active ? "active" : ""}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (item.special === "link") handleLinkInsert();
                        else exec(item.cmd, item.arg);
                      }}>
                      {item.icon}
                    </button>
                  );
                }),
              )}
            </div>

            {/* Editable */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyUp={() => forceUpdate((n) => n + 1)}
              onMouseUp={() => forceUpdate((n) => n + 1)}
              data-placeholder={placeholder}
              className="rte-editable"
            />
          </>
        ) : (
          <>
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-mono text-muted-foreground">
                HTML Source
              </span>
            </div>
            <textarea
              rows={14}
              value={rawHtml}
              onChange={(e) => handleHtmlChange(e.target.value)}
              className="w-full font-mono text-sm bg-background px-4 py-3 resize-y focus:outline-none"
              placeholder="<p>Masukkan HTML di sini...</p>"
              spellCheck={false}
            />
          </>
        )}

        {/* Footer */}
        <div className="px-3 py-1.5 border-t bg-muted/20 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {mode === "visual" ? "Rich Text Editor" : "HTML Editor"}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {plainLen.toLocaleString()} karakter · {rawHtml.length} kar. HTML
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({
  isActive,
  onClick,
  disabled,
}: {
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center transition-transform duration-150 active:scale-95 disabled:opacity-60">
    {isActive ? (
      <Badge className="gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer text-xs px-2.5 py-0.5 rte-badge-pulse">
        <CheckCircle2 className="h-3 w-3" />
        Aktif
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="gap-1.5 cursor-pointer text-xs px-2.5 py-0.5 hover:bg-muted/80 border border-dashed">
        <X className="h-3 w-3" />
        Nonaktif
      </Badge>
    )}
  </button>
);

// ─── Expandable Table Row ─────────────────────────────────────────────────────

interface TentangDetailRowProps {
  tentang: ICmsTentang;
  index: number;
  onEdit: (t: ICmsTentang) => void;
  onDelete: (t: ICmsTentang) => void;
  onToggle: (id: number) => void;
  isToggling: boolean;
}

const TentangDetailRow = ({
  tentang,
  index,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}: TentangDetailRowProps) => {
  const [expanded, setExpanded] = useState(false);

  const plainPreview = tentang.deskripsi
    ? tentang.deskripsi
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 130)
    : null;
  const charCount = tentang.deskripsi?.length ?? 0;

  return (
    <>
      <TableRow
        className="rte-fade-in hover:bg-muted/50 transition-colors"
        style={{ animationDelay: `${index * 40}ms` }}>
        <TableCell className="w-10 pr-0 pl-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-md hover:bg-muted transition-colors">
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground rte-expand-icon ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        </TableCell>

        <TableCell
          onClick={() => setExpanded((v) => !v)}
          className="cursor-pointer py-3.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <p className="font-semibold text-sm">{tentang.judul_section}</p>
            </div>
            {plainPreview ? (
              <p className="text-xs text-muted-foreground line-clamp-1 pl-5">
                {plainPreview}
                {charCount > 130 ? "…" : ""}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic pl-5">
                Belum ada deskripsi
              </p>
            )}
          </div>
        </TableCell>

        <TableCell className="hidden md:table-cell w-44 py-3.5">
          {tentang.gambar_url ? (
            <div className="flex items-center gap-1.5 max-w-[160px]">
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {tentang.gambar_url}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/40 italic">
              Tidak ada gambar
            </span>
          )}
        </TableCell>

        <TableCell className="text-center w-28 py-3.5">
          <StatusBadge
            isActive={tentang.is_active === 1}
            onClick={() => onToggle(tentang.id)}
            disabled={isToggling}
          />
        </TableCell>

        <TableCell className="w-24 py-3.5">
          <div className="flex items-center justify-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rte-btn-scale text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(tentang)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rte-btn-scale text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(tentang)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-gradient-to-b from-muted/30 to-transparent hover:bg-muted/30">
          <TableCell colSpan={5} className="py-5 px-6 rte-slide-down">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Eye className="h-3 w-3" /> Tampilan Deskripsi
                </p>
                {tentang.deskripsi ? (
                  <div
                    className="prose prose-sm max-w-none text-sm rounded-lg border bg-background p-5 shadow-sm"
                    dangerouslySetInnerHTML={{ __html: tentang.deskripsi }}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground italic">
                      Belum ada deskripsi
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border bg-background p-4 shadow-sm text-sm self-start">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> Detail
                </p>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Judul Section
                  </p>
                  <p className="font-medium">{tentang.judul_section}</p>
                </div>
                {tentang.gambar_url && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                      URL Gambar
                    </p>
                    <p className="text-xs font-mono break-all text-muted-foreground bg-muted rounded px-2 py-1">
                      {tentang.gambar_url}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Panjang Konten
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (charCount / 2000) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {charCount.toLocaleString()} kar.
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Status
                  </p>
                  <StatusBadge
                    isActive={tentang.is_active === 1}
                    onClick={() => onToggle(tentang.id)}
                    disabled={isToggling}
                  />
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CmsTentangPage = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICmsTentang | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICmsTentang | null>(null);
  const [formData, setFormData] = useState<ICmsTentangFormData>(EMPTY_FORM);
  const [editorKey, setEditorKey] = useState(0);

  const {
    data: tentangResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["cms-tentang-all"],
    queryFn: () => masterService.getAllCmsTentang(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const tentangList: ICmsTentang[] = tentangResponse?.data ?? [];
  const activeCount = tentangList.filter((t) => t.is_active === 1).length;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-tentang-all"] });
    queryClient.invalidateQueries({ queryKey: ["cms-tentang-aktif"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: ICmsTentangFormData) =>
      masterService.createCmsTentang(data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ICmsTentangFormData }) =>
      masterService.updateCmsTentang(id, data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => masterService.deleteCmsTentang(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => masterService.toggleActiveCmsTentang(id),
    onSuccess: () => invalidate(),
  });

  const openCreate = () => {
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setEditorKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const openEdit = (tentang: ICmsTentang) => {
    setEditTarget(tentang);
    setFormData({
      judul_section: tentang.judul_section,
      deskripsi: tentang.deskripsi ?? "",
      gambar_url: tentang.gambar_url ?? "",
      is_active: tentang.is_active,
    });
    setEditorKey((k) => k + 1);
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

  return (
    <>
      <style>{STYLES}</style>

      <div className="container mx-auto w-full space-y-5 py-6">
        {/* Header */}
        <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm rte-fade-in">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    CMS Tentang Beasiswa
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground pl-10">
                  Kelola konten section "Tentang Beasiswa" pada landing page.
                </p>
              </div>
              <Button
                onClick={openCreate}
                size="sm"
                className="gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                <Plus className="h-4 w-4" />
                Tambah Konten
              </Button>
            </div>
          </CardHeader>
          {!isLoading && !isError && (
            <CardContent className="pt-0 pb-4">
              <div className="flex flex-wrap gap-3 pl-10">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1">
                  <FileText className="h-3 w-3" />
                  {tentangList.length} total konten
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {activeCount} aktif
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Info banner */}
        <div
          className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 rte-fade-in"
          style={{ animationDelay: "60ms" }}>
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Gunakan <strong>Rich Text Editor</strong> untuk memformat deskripsi
            secara visual, atau beralih ke mode <strong>HTML</strong> untuk
            kontrol penuh. Hanya <strong>satu konten</strong> yang aktif pada
            satu waktu.
          </p>
        </div>

        {/* Table */}
        <Card
          className="shadow-sm rte-fade-in"
          style={{ animationDelay: "80ms" }}>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <div className="h-12 w-12 rounded-full border-2 border-muted border-t-primary animate-spin" />
                <span className="text-sm">Memuat data konten...</span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Gagal memuat data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Terjadi kesalahan saat mengambil data.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2 mt-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Coba Lagi
                </Button>
              </div>
            ) : tentangList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Belum ada konten</p>
                  <p className="text-xs text-muted-foreground">
                    Buat konten pertama untuk section "Tentang Beasiswa".
                  </p>
                </div>
                <Button size="sm" onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Konten Pertama
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-10" />
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">
                      Judul &amp; Deskripsi
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-44 font-semibold text-xs uppercase tracking-wide">
                      Gambar
                    </TableHead>
                    <TableHead className="w-28 text-center font-semibold text-xs uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="w-24 text-center font-semibold text-xs uppercase tracking-wide">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tentangList.map((tentang, i) => (
                    <TentangDetailRow
                      key={tentang.id}
                      index={i}
                      tentang={tentang}
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

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(v) => !v && closeForm()}>
          <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
            <DialogHeader className="pb-3 border-b">
              <DialogTitle className="flex items-center gap-2.5 text-lg">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  {editTarget ? (
                    <Pencil className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}
                </div>
                {editTarget
                  ? "Edit Konten Tentang Beasiswa"
                  : "Tambah Konten Baru"}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="konten" className="w-full mt-2">
              <TabsList className="w-full mb-5 h-10">
                <TabsTrigger value="konten" className="flex-1 gap-2 text-sm">
                  <FileText className="h-3.5 w-3.5" />
                  Konten
                </TabsTrigger>
                <TabsTrigger
                  value="pengaturan"
                  className="flex-1 gap-2 text-sm">
                  <Settings2 className="h-3.5 w-3.5" />
                  Pengaturan
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="konten"
                className="space-y-5 mt-0 rte-fade-in">
                <div className="space-y-2">
                  <Label
                    htmlFor="judul_section"
                    className="text-sm font-semibold">
                    Judul Section
                  </Label>
                  <Input
                    id="judul_section"
                    placeholder="Tentang Beasiswa"
                    value={formData.judul_section}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        judul_section: e.target.value,
                      }))
                    }
                    className="transition-shadow focus:shadow-sm"
                  />
                </div>

                <RichTextEditor
                  key={editorKey}
                  value={formData.deskripsi ?? ""}
                  onChange={(html) =>
                    setFormData((p) => ({ ...p, deskripsi: html }))
                  }
                  placeholder="Tulis deskripsi program beasiswa di sini..."
                />
              </TabsContent>

              <TabsContent
                value="pengaturan"
                className="space-y-5 mt-0 rte-fade-in">
                <div className="space-y-2">
                  <Label
                    htmlFor="gambar_url"
                    className="text-sm font-semibold flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    URL Gambar Ilustrasi
                    <span className="text-xs font-normal text-muted-foreground">
                      (opsional)
                    </span>
                  </Label>
                  <Input
                    id="gambar_url"
                    placeholder="/images/tentang-beasiswa.png atau https://..."
                    value={formData.gambar_url ?? ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, gambar_url: e.target.value }))
                    }
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gambar yang ditampilkan berdampingan dengan teks deskripsi.
                  </p>
                </div>

                {formData.gambar_url && (
                  <div className="rounded-xl border-2 border-dashed p-4 space-y-2.5 bg-muted/20 rte-fade-in">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Eye className="h-3 w-3" /> Preview Gambar
                    </p>
                    <img
                      src={formData.gambar_url}
                      alt="preview"
                      className="max-h-44 rounded-lg object-contain border shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold cursor-pointer">
                      Jadikan Aktif
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Hanya satu konten yang aktif. Konten lain otomatis
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
            </Tabs>

            <DialogFooter className="gap-2 pt-4 border-t mt-2">
              <Button
                variant="outline"
                onClick={closeForm}
                disabled={isMutating}>
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isMutating || !formData.judul_section?.trim()}
                className="gap-2 min-w-[140px] transition-all duration-200 hover:shadow-md">
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editTarget ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editTarget ? "Simpan Perubahan" : "Tambah Konten"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                Hapus Konten?
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-1">
                Kamu akan menghapus konten{" "}
                <span className="font-semibold text-foreground">
                  "{deleteTarget?.judul_section}"
                </span>
                . Tindakan ini <strong>tidak dapat dibatalkan</strong>.
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
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Hapus Konten
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default CmsTentangPage;
