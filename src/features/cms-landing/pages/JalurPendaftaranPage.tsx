/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterService } from "../../../services/masterService";
import { STALE_TIME } from "../../../constants/reactQuery";
import type { ICmsJalurPendaftaran, ICmsJalurFormData } from "../../../types/master";
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
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Link,
  Unlink,
  Undo,
  Redo,
  Code,
  Quote,
  Minus,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { Separator } from "../../../components/ui/separator";
import { cn } from "../../../lib/utils";

// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemRow {
  text: string;
  urutan: number;
  template_link?: string;
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

// ─── WYSIWYG Toolbar Button ───────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarButtonProps) => (
  <Tooltip delayDuration={400}>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-sm text-sm transition-colors",
          "hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}>
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="text-xs">
      {tooltip}
    </TooltipContent>
  </Tooltip>
);

// ─── Insert Link Modal ────────────────────────────────────────────────────────

interface LinkModalProps {
  open: boolean;
  initialUrl: string;
  onConfirm: (url: string, openInNewTab: boolean) => void;
  onRemove: () => void;
  onClose: () => void;
  isEditing: boolean;
}

const LinkModal = ({
  open,
  initialUrl,
  onConfirm,
  onRemove,
  onClose,
  isEditing,
}: LinkModalProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [newTab, setNewTab] = useState(true);

  const prevOpen = useState(open)[0];
  if (open && !prevOpen) {
    // will re-render with fresh state on next open via key trick below
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            {isEditing ? "Edit Tautan" : "Sisipkan Tautan"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="link-url">URL Tautan</Label>
            <Input
              id="link-url"
              placeholder="https://contoh.com"
              value={url}
              autoFocus
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url.trim()) {
                  e.preventDefault();
                  onConfirm(url.trim(), newTab);
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <Label htmlFor="link-newtab" className="text-sm cursor-pointer">
              Buka di tab baru
            </Label>
            <Switch
              id="link-newtab"
              checked={newTab}
              onCheckedChange={setNewTab}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive gap-1.5"
                onClick={onRemove}>
                <Unlink className="h-3.5 w-3.5" />
                Hapus Tautan
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!url.trim()}
              onClick={() => onConfirm(url.trim(), newTab)}
              className="gap-1.5">
              <Link className="h-3.5 w-3.5" />
              {isEditing ? "Simpan" : "Sisipkan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Insert Image Modal ───────────────────────────────────────────────────────

interface ImageModalProps {
  open: boolean;
  onConfirm: (src: string, alt: string) => void;
  onClose: () => void;
}

const ImageModal = ({ open, onConfirm, onClose }: ImageModalProps) => {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState(false);

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setSrc("");
      setAlt("");
      setPreview(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Sisipkan Gambar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="img-src">URL Gambar</Label>
            <div className="flex gap-2">
              <Input
                id="img-src"
                placeholder="https://contoh.com/gambar.jpg"
                value={src}
                autoFocus
                onChange={(e) => {
                  setSrc(e.target.value);
                  setPreview(false);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!src.trim()}
                onClick={() => setPreview(true)}
                className="flex-shrink-0">
                Preview
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="img-alt">Teks Alt (opsional)</Label>
            <Input
              id="img-alt"
              placeholder="Deskripsi gambar untuk aksesibilitas"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </div>

          {preview && src && (
            <div className="rounded-md border bg-muted/30 p-2 flex items-center justify-center min-h-[100px]">
              <img
                src={src}
                alt={alt || "preview"}
                className="max-h-48 max-w-full rounded object-contain"
                onError={() => setPreview(false)}
              />
            </div>
          )}
          {preview && !src && (
            <p className="text-xs text-destructive">URL gambar tidak valid.</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            size="sm"
            disabled={!src.trim()}
            onClick={() => {
              onConfirm(src.trim(), alt.trim());
              setSrc("");
              setAlt("");
              setPreview(false);
            }}
            className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Sisipkan Gambar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── WYSIWYG Editor Component ─────────────────────────────────────────────────

interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const WysiwygEditor = ({
  value,
  onChange,
  placeholder = "Tulis deskripsi di sini...",
  minHeight = 160,
}: WysiwygEditorProps) => {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 cursor-pointer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-md my-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2",
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-p:text-sm prose-p:leading-relaxed prose-p:my-1",
          "prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
          "prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground",
          "prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:text-xs",
          "prose-a:text-primary",
          "prose-img:rounded-md prose-img:my-2",
        ),
      },
    },
  });

  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    editor?.commands.setContent(value || "", { emitUpdate: false });
  }

  const handleLinkConfirm = useCallback(
    (url: string, openInNewTab: boolean) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: openInNewTab ? "_blank" : null })
        .run();
      setLinkModalOpen(false);
    },
    [editor],
  );

  const handleLinkRemove = useCallback(() => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkModalOpen(false);
  }, [editor]);

  const handleImageConfirm = useCallback(
    (src: string, alt: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src, alt }).run();
      setImageModalOpen(false);
    },
    [editor],
  );

  if (!editor) return null;

  const currentLinkUrl = editor.getAttributes("link").href ?? "";

  return (
    <>
      <div className="rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow">
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40">
          <ToolbarButton
            tooltip="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}>
            <Undo className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Redo (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}>
            <Redo className="h-3.5 w-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Heading 2"
            isActive={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }>
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Heading 3"
            isActive={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }>
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Bold (Ctrl+B)"
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Italic (Ctrl+I)"
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Underline (Ctrl+U)"
            isActive={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <Underline className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Inline Code"
            isActive={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Bullet List"
            isActive={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Ordered List"
            isActive={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Blockquote"
            isActive={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Align Left"
            isActive={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Align Center"
            isActive={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Align Right"
            isActive={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip={
              editor.isActive("link") ? "Edit Tautan" : "Sisipkan Tautan"
            }
            isActive={editor.isActive("link")}
            onClick={() => setLinkModalOpen(true)}>
            <Link className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Hapus Tautan"
            disabled={!editor.isActive("link")}
            onClick={() =>
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
            }>
            <Unlink className="h-3.5 w-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Sisipkan Gambar"
            onClick={() => setImageModalOpen(true)}>
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <EditorContent
          editor={editor}
          style={{ minHeight }}
          className="overflow-y-auto"
        />
      </div>

      <LinkModal
        open={linkModalOpen}
        initialUrl={currentLinkUrl}
        isEditing={editor.isActive("link")}
        onConfirm={handleLinkConfirm}
        onRemove={handleLinkRemove}
        onClose={() => setLinkModalOpen(false)}
      />

      <ImageModal
        open={imageModalOpen}
        onConfirm={handleImageConfirm}
        onClose={() => setImageModalOpen(false)}
      />
    </>
  );
};

// ─── Sub-component: Item List Editor ─────────────────────────────────────────

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
  const [draftLink, setDraftLink] = useState("");

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([
      ...items,
      {
        text: trimmed,
        template_link: draftLink.trim() || undefined,
        urutan: items.length + 1,
      },
    ]);
    setDraft("");
    setDraftLink("");
  };

  const removeItem = (idx: number) => {
    const next = items
      .filter((_, i) => i !== idx)
      .map((it, i) => ({ ...it, urutan: i + 1 }));
    onChange(next);
  };

  const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
    const next = items.map((it, i) =>
      i === idx ? { ...it, [field]: value } : it
    );
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 group bg-muted/20 p-2 rounded-md border">
              <div className="flex-shrink-0 mt-2 cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <span className="text-xs text-muted-foreground w-4 flex-shrink-0 mt-2 font-mono">
                {idx + 1}.
              </span>
              <div className="flex-1 space-y-2">
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(idx, "text", e.target.value)}
                  className="h-8 text-sm font-medium"
                  placeholder="Deskripsi syarat/dokumen"
                />
                <Input
                  value={item.template_link || ""}
                  onChange={(e) => updateItem(idx, "template_link", e.target.value)}
                  className="h-7 text-xs text-muted-foreground"
                  placeholder="https://... (Kosongkan jika tidak ada template)"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeItem(idx)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-start bg-muted/40 p-3 rounded-md border border-dashed">
        <div className="flex-1 space-y-2">
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
          <Input
            placeholder="Link Template Unduhan (Opsional)"
            value={draftLink}
            className="h-7 text-xs"
            onChange={(e) => setDraftLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-shrink-0 gap-1 h-8"
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
              <p
                className="text-xs text-muted-foreground line-clamp-1 [&_*]:inline"
                dangerouslySetInnerHTML={{
                  __html: jalur.deskripsi,
                }}
              />
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

      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="py-3 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <span>
                          {s.syarat}
                          {(s as any).template_link && (
                            <span className="block text-xs text-blue-500 mt-1">
                              Link: {(s as any).template_link}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ada syarat
                  </p>
                )}
              </div>

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
                        <span>
                          {d.dokumen}
                          {(d as any).template_link && (
                            <span className="block text-xs text-blue-500 mt-1">
                              Link: {(d as any).template_link}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ada dokumen
                  </p>
                )}
              </div>

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

              {jalur.deskripsi && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Deskripsi
                  </p>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: jalur.deskripsi }}
                  />
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

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICmsJalurPendaftaran | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICmsJalurPendaftaran | null>(null);
  const [formData, setFormData] = useState<ICmsJalurFormData>(EMPTY_FORM);
  const [syaratItems, setSyaratItems] = useState<ItemRow[]>([]);
  const [dokumenItems, setDokumenItems] = useState<ItemRow[]>([]);

  // UBAH: Tambah state file untuk gambar
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-jalur-all"] });
    queryClient.invalidateQueries({ queryKey: ["cms-jalur-aktif"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => masterService.createCmsJalur(data),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
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
      jalur.syarat.map((s: any) => ({
        text: s.syarat,
        urutan: s.urutan,
        template_link: s.template_link,
      }))
    );
    setDokumenItems(
      jalur.dokumen.map((d: any) => ({
        text: d.dokumen,
        urutan: d.urutan,
        template_link: d.template_link,
      }))
    );
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setSyaratItems([]);
    setDokumenItems([]);
    // UBAH: Reset file
    setImageFile(null);
  };

  const handleSubmit = () => {
    if (!formData.judul.trim()) return;

    // UBAH: Menjadikan array stringify + ubah root obj jadi FormData
    const syaratPayload = syaratItems.map((s, i) => ({
      syarat: s.text,
      template_link: s.template_link,
      urutan: i + 1,
    }));
    const dokumenPayload = dokumenItems.map((d, i) => ({
      dokumen: d.text,
      template_link: d.template_link,
      urutan: i + 1,
    }));

    const fd = new FormData();
    fd.append("judul", formData.judul);
    if (formData.deskripsi) fd.append("deskripsi", formData.deskripsi);
    fd.append("urutan", String(formData.urutan || 0));
    fd.append("is_active", String(formData.is_active));
    
    fd.append("syarat", JSON.stringify(syaratPayload));
    fd.append("dokumen", JSON.stringify(dokumenPayload));

    if (imageFile) fd.append("gambar_url", imageFile);
    else if (formData.gambar_url) fd.append("gambar_url", formData.gambar_url);

    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto w-full space-y-6 py-6">
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

      <Card>
        <CardContent className="pt-4 px-4 pb-0">
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
                Dokumen Umum
                {syaratItems.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-xs h-4 px-1">
                    {syaratItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="dokumen" className="flex-1">
                Dokumen Khusus
                {dokumenItems.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-xs h-4 px-1">
                    {dokumenItems.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

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
                <Label>Deskripsi</Label>
                <WysiwygEditor
                  value={formData.deskripsi ?? ""}
                  onChange={(html) =>
                    setFormData((p) => ({ ...p, deskripsi: html }))
                  }
                  placeholder="Deskripsi singkat jalur pendaftaran ini..."
                  minHeight={160}
                />
                <p className="text-xs text-muted-foreground">
                  Nilai disimpan sebagai HTML dan akan dirender di landing page.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* UBAH: Area Upload Gambar */}
                <div className="space-y-1.5">
                  <Label>Gambar Ikon/Logo</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                    />
                  </div>
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

                {/* UBAH: Area Preview Gambar */}
                {(imageFile || formData.gambar_url) && (
                  <div className="col-span-2">
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : formData.gambar_url} 
                      alt="preview" 
                      className="h-20 w-auto object-contain rounded border p-1" 
                    />
                  </div>
                )}
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
                Saat menyimpan, seluruh syarat lama akan diganti dengan daftar ini.
              </p>
            </TabsContent>

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
                Saat menyimpan, seluruh dokumen lama akan diganti dengan daftar ini.
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