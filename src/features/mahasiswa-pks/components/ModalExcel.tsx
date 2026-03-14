import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Loader2, AlertTriangle } from "lucide-react";

import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ModalExcelProps {
  idTrxPks: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalExcel: React.FC<ModalExcelProps> = ({ idTrxPks, open, setOpen }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = "/data/templates/Template Import Mahasiswa.xlsx";
    a.download = "Template Import Mahasiswa.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await axiosInstanceFormData.post(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/import-excel-mahasiswa/${idTrxPks}`,
        formData,
      );

      queryClient.invalidateQueries({
        queryKey: ["pks", "mahasiswa"],
        exact: false,
      });

      // ✅ TOAST SUCCESS
      toast.success("Berhasil mengupload file");

      // ✅ REVALIDATE CACHE
      queryClient.invalidateQueries({
        queryKey: ["pks", "detail", idTrxPks],
      });

      // optional
      setOpen(false);
    } catch (err: any) {
      // ❌ TOAST ERROR
      toast(err.message);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="md" className="font-inter">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
        </DialogHeader>

        <Alert className="border-amber-400 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            Perhatian Sebelum Upload
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Pastikan format kolom sesuai template</li>
              <li>NIM tidak boleh duplikat</li>
              <li>
                <strong>Status Aktif</strong> hanya boleh:
                <span className="ml-1">Aktif / Non Aktif</span>
              </li>
              <li>
                <strong>Kluster</strong> hanya boleh:
                <span className="ml-1">Reguler / Afirmasi</span>
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* DOWNLOAD */}
        <div>
          <Label className="block mb-2 text-gray-700">Unduh Template</Label>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Excel
          </Button>
        </div>

        <hr className="border-gray-200" />

        {/* UPLOAD */}
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label className="block mb-2 text-gray-700">
              Unggah Hasil dari Template (.xlsx)
            </Label>
            <Input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={(e) =>
                setSelectedFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalExcel;
