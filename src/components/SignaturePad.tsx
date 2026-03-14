import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SignaturePadProps {
  label?: string;
  onSave?: (signature: string) => void;
  error?: boolean;
  errorMessage?: string;
  isRequired?: boolean;
  value?: string; // untuk preview
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  onSave,
  error,
  errorMessage,
  isRequired = false,
  value,
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [savedSignature, setSavedSignature] = useState<string | null>(
    value || null,
  );

  const handleClear = () => {
    signatureRef.current?.clear();
    setSavedSignature(null);
    onSave?.("");
  };

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataUrl = signatureRef.current.toDataURL("image/png");
      setSavedSignature(dataUrl);
      onSave?.(dataUrl);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}

      {savedSignature ? (
        // ✅ Preview mode
        <div className="space-y-2">
          <div className="border-2 border-gray-300 rounded-md p-4 bg-white">
            <img
              src={savedSignature}
              alt="Tanda tangan"
              className="w-full h-40 object-contain"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSavedSignature(null)}
          >
            Ubah Tanda Tangan
          </Button>
        </div>
      ) : (
        // ✅ Draw mode
        <div className="space-y-2">
          <div
            className={`border-2 rounded-md ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          >
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: "w-full h-40 cursor-crosshair",
              }}
              backgroundColor="white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              Hapus
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              Simpan Tanda Tangan
            </Button>
          </div>
        </div>
      )}

      {error && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};
