import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import type { Area } from "react-easy-crop";
import { Button } from "./ui/button";

interface DropAndCropRectangleProps {
  value?: string | File | null; // ✅ ubah di sini
  onChange?: (value: File | null) => void;
  name?: string;
  error?: boolean;
  errorMessage?: string;
}

const DropAndCropRectangle = ({
  value,
  onChange,
  error,
  errorMessage,
}: DropAndCropRectangleProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === "string") {
      setImageSrc(value);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        onChange?.(null);
        setCrop({ x: 0, y: 0 }); // reset crop saat drop baru
        setZoom(1); // reset zoom saat drop baru
      });
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const outputWidth = 354;
    const outputHeight = 472;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    if (!ctx) return;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "foto-3x4.png", { type: "image/png" });
      onChange?.(file);

      const croppedUrl = URL.createObjectURL(file);
      setImageSrc(croppedUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }, "image/png");
  }, [imageSrc, croppedAreaPixels, onChange]);

  return (
    <>
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors duration-200 ${
          isDragActive
            ? "border-green-500 text-green-600"
            : "border-gray-400 text-gray-600"
        } cursor-pointer`}
      >
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? "Letakkan gambar di sini"
            : "Seret dan jatuhkan gambar ke sini, atau klik untuk memilih"}
        </p>
        {error && errorMessage && (
          <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-2 flex-wrap">
        {/* Cropper */}
        {imageSrc && (
          <div className="relative w-32 h-32 lg:w-48 lg:h-48 rounded-sm overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              aspect={3 / 4}
            />
          </div>
        )}

        {/* Result */}
        {value && (
          <img
            src={typeof value === "string" ? value : URL.createObjectURL(value)}
            alt="Cropped"
            className="w-32 h-32 lg:w-48 lg:h-48 object-cover rounded-full"
          />
        )}
      </div>

      {/* Button Crop */}
      {imageSrc && (
        <div className="mt-0.5 flex justify-center">
          <Button
            onClick={getCroppedImg}
            variant="outline"
            size="sm"
            type="button"
          >
            Potong
          </Button>
        </div>
      )}
    </>
  );
};

export default DropAndCropRectangle;
