import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { User as UserIcon } from "lucide-react";

interface SecureImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export const SecureImage = ({ src, alt, className }: SecureImageProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!src || !accessToken) return;

    let objectUrl: string;
    const fetchImage = async () => {
      try {
        // Hapus tempelan token di URL jika sebelumnya ada
        const cleanSrc = src.split("&token=")[0];

        const response = await axios.get(cleanSrc, {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Token dikirim aman via Header
          },
          responseType: "blob", // Ambil sebagai data biner
        });

        objectUrl = URL.createObjectURL(response.data);
        setImgSrc(objectUrl);
      } catch (error) {
        console.error("Gagal memuat gambar aman", error);
        setIsError(true);
      }
    };

    fetchImage();

    // Bersihkan memori browser saat berpindah halaman
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, accessToken]);

  if (!src || isError) {
    return (
      <div className={`${className} bg-slate-100 flex items-center justify-center`}>
        <UserIcon className="w-1/2 h-1/2 text-slate-400" />
      </div>
    );
  }

  if (!imgSrc) {
    return (
      <div className={`${className} bg-slate-200 animate-pulse`} />
    );
  }

  return <img src={imgSrc} alt={alt} className={className} />;
};