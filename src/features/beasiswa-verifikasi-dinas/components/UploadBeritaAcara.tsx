import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, AlertTriangle } from "lucide-react";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import { BEASISWA_SERVICE_BASE_URL } from "@/constants/api";

export default function UploadBeritaAcara() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await axiosInstanceFormData.post(
        `${BEASISWA_SERVICE_BASE_URL}/beasiswa/upload-berita-acara-dinas`,
        {
          file: selectedFile,
        }
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
    <Card className="shadow-none">
      <CardContent className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Dengan mengupload berita acara maka beasiswa yang Status Kelulusan
            Verifikator Dinasnya "Lulus" akan dilanjutkan ke proses berikutnya.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="fileUpload" className="block mb-2 text-gray-700">
              Upload Berita Acara (.pdf)
            </Label>
            <Input
              id="fileUpload"
              type="file"
              accept=".pdf"
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
  );
}
