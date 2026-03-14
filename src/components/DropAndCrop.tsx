import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import type { Area } from "react-easy-crop";
import { Button } from "./ui/button";

interface DropAndCropProps {
  aspectRatio?: number;
}

const DropAndCrop = ({ aspectRatio = 1 }: DropAndCropProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setCroppedImageUrl(null);
    });
    reader.readAsDataURL(file);
  }, []);

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

    const cropRatio = croppedAreaPixels.width / croppedAreaPixels.height;
    const outputWidth = 300;
    const outputHeight = outputWidth / cropRatio;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const base64Image = canvas.toDataURL("image/jpeg");
    setCroppedImageUrl(base64Image);
  }, [imageSrc, croppedAreaPixels]);

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
            ? "Drop the image here..."
            : "Drag & drop an image here, or click to select"}
        </p>
      </div>

      <div className="flex justify-center gap-2 mt-2 flex-wrap">
        {/* Cropper */}
        {imageSrc && (
          <div className="relative w-32 h-32 lg:w-48 lg:h-48 rounded-sm overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {/* Result */}
        {croppedImageUrl && (
          <img
            src={croppedImageUrl}
            alt="Cropped"
            className="w-32 h-32 lg:w-48 lg:h-48 object-contain"
          />
        )}
      </div>

      {/* Button Crop */}
      {imageSrc && (
        <div className="mt-0.5 flex justify-center">
          <Button onClick={getCroppedImg} variant="outline" size="sm">
            Potong
          </Button>
        </div>
      )}
    </>
  );
};

export default DropAndCrop;
