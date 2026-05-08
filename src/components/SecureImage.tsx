import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { User } from "lucide-react";

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const SecureImage = ({ 
  src, 
  alt, 
  className, 
  fallbackIcon, 
  ...props 
}: SecureImageProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!src) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (src.startsWith("blob:") || src.startsWith("data:")) {
      setImgSrc(src);
      setIsError(false);
      setIsLoading(false);
      return;
    }

    if (!accessToken) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      setIsLoading(true);
      setIsError(false);
      
      try {
        const cleanSrc = src.split("&token=")[0];

        const response = await axios.get(cleanSrc, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        });

        if (response.data.type && response.data.type.includes("application/json")) {
           throw new Error("Response is JSON, not an image");
        }

        if (isMounted) {
          objectUrl = URL.createObjectURL(response.data);
          setImgSrc(objectUrl);
          setIsError(false);
        }
      } catch (error) {
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, accessToken]);

  if (isLoading) {
    return <div className={`${className} bg-slate-200 animate-pulse`} />;
  }

  if (isError || !imgSrc) {
    return (
      <div className={`${className} bg-slate-100 flex flex-col items-center justify-center text-slate-400`}>
        {fallbackIcon || <User className="w-1/2 h-1/2 opacity-40" />}
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      onError={() => setIsError(true)} 
      {...props} 
    />
  );
};