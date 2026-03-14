import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, Loader2 } from "lucide-react";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { BEASISWA_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";

const BeasiswaHasilVerifikasiPage: React.FC = () => {
  useRedirectIfHasNotAccess("R");

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstanceJson.get(
        `${BEASISWA_SERVICE_BASE_URL}/beasiswa/download-excel-hasil-verifikasi-dinas`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Data Hasil Verifikasi Dinas.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal download:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await axiosInstanceFormData.post(
        `${BEASISWA_SERVICE_BASE_URL}/beasiswa/upload-excel-hasil-verifikasi-dinas`,
        {
          file: selectedFile,
        },
      );
    } catch (err) {
      console.error("Gagal upload:", err);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "Hasil Verifikasi Dinas Prov / Kab/Kota" }]}
      />
      <p className="text-xl font-semibold mt-4">
        Hasil Verifikasi Dinas Prov / Kab/Kota
      </p>

      <div className="mt-3 space-y-6">
        <Card className="shadow-none">
          <CardContent className="space-y-6">
            {/* DOWNLOAD SECTION */}
            <div>
              <Label className="block mb-2 text-gray-700">
                Unduh Template / Data Hasil Verifikasi
              </Label>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengunduh...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Excel
                  </>
                )}
              </Button>
            </div>

            <hr className="border-gray-200" />

            {/* UPLOAD SECTION */}
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label
                  htmlFor="fileUpload"
                  className="block mb-2 text-gray-700"
                >
                  Upload Hasil Edit Data Hasil Verifikasi (.xlsx)
                </Label>
                <Input
                  id="fileUpload"
                  type="file"
                  accept=".xlsx"
                  ref={fileInputRef}
                  onChange={(e) =>
                    setSelectedFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>

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
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BeasiswaHasilVerifikasiPage;
