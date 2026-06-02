/* eslint-disable @typescript-eslint/no-unused-vars */
import { type FC, useState, useEffect } from "react";
import { Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSecureFileUrl } from "@/utils/fileHelper";
import { toast } from "sonner";

interface KoreksiFieldState {
  field: string;
  label: string;
  catatan: string;
}

interface KoreksiInfoItemProps {
  icon: FC<{ className?: string }>;
  label: string;
  value?: string | null;
  fileUrl?: string | null;
  fileLabel?: string;
  onDownload?: (url: string) => void;
  showKoreksi?: boolean;
  fieldKey?: string;
  koreksiFields?: KoreksiFieldState[];
  onToggle?: (field: string, label: string) => void;
  onCatatanChange?: (field: string, catatan: string) => void;
}

const KoreksiInfoItem: FC<KoreksiInfoItemProps> = ({
  icon: Icon,
  label,
  value,
  fileUrl,
  fileLabel = "Lihat File",
  showKoreksi = false,
  fieldKey,
  koreksiFields = [],
  onToggle,
  onCatatanChange,
}) => {
  const isChecked = !!koreksiFields.find((k) => k.field === fieldKey);
  const current = koreksiFields.find((k) => k.field === fieldKey);

  const [previewData, setPreviewData] = useState<{ url: string; type: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isModalOpen && previewData?.url) {
      const timer = setTimeout(() => {
        window.URL.revokeObjectURL(previewData.url);
        setPreviewData(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, previewData]);

  const handlePreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!fileUrl) return;

    setIsLoading(true);
    try {
      const data = await getSecureFileUrl(fileUrl);
      
      // PERBAIKAN FINAL: Selalu fetch data ke memori lokal untuk membuang header 'attachment'
      const response = await fetch(data.url);
      const blobContent = await response.blob();
      
      let expectedType = data.type || "application/pdf";
      
      if (expectedType.includes("octet-stream") || expectedType === "") {
        const lowerUrl = fileUrl.toLowerCase();
        if (lowerUrl.includes(".png")) expectedType = "image/png";
        else if (lowerUrl.includes(".jpg") || lowerUrl.includes(".jpeg")) expectedType = "image/jpeg";
        else expectedType = "application/pdf";
      }

      // Buat URL lokal yang bersih dari paksaan download server
      const newBlob = new Blob([blobContent], { type: expectedType });
      const finalUrl = window.URL.createObjectURL(newBlob);
      
      // Bersihkan url presigned lama
      window.URL.revokeObjectURL(data.url);

      setPreviewData({ url: finalUrl, type: expectedType });
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Gagal memuat pratinjau dokumen. Sesi mungkin kedaluwarsa.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3 py-2">
        <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p
              className={`text-sm break-words ${
                isChecked && showKoreksi ? "text-amber-600 font-medium" : ""
              }`}>
              {value || "-"}
            </p>

            {fileUrl && (
              <button
                type="button"
                onClick={handlePreview}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-xs text-primary border border-primary/40 rounded-md px-2 py-0.5 hover:bg-primary/10 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
                {isLoading ? "Memuat..." : fileLabel}
              </button>
            )}

            {showKoreksi && fieldKey && (
              <label className="inline-flex items-center gap-1 cursor-pointer ml-auto flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle?.(fieldKey, label)}
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-amber-500"
                />
                <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                  Koreksi
                </span>
              </label>
            )}
          </div>

          {showKoreksi && isChecked && fieldKey && (
            <input
              type="text"
              placeholder={`Catatan untuk ${label}...`}
              value={current?.catatan ?? ""}
              onChange={(e) => onCatatanChange?.(fieldKey, e.target.value)}
              className="mt-1.5 w-full text-xs border border-amber-300 rounded-md px-2 py-1.5 bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-amber-400"
            />
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="lg" className="h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">Pratinjau: {label}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-muted/20 rounded-md overflow-hidden border">
            {previewData?.type.includes("image") ? (
              <img
                src={previewData.url}
                alt={`Pratinjau ${label}`}
                className="w-full h-full object-contain bg-black/5"
              />
            ) : (
              <iframe
                src={previewData?.url}
                className="w-full h-full border-0"
                title={`Pratinjau ${label}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KoreksiInfoItem;