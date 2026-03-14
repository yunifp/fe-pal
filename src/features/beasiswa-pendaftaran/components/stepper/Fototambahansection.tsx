import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import DropAndCropRectangle from "@/components/DropAndCropRectangle";
import type { BeasiswaFormData } from "@/types/beasiswa";
import type { FieldErrors, UseFormSetValue } from "react-hook-form";

const fotoTambahanConfig = [
  {
    key: "foto_depan" as keyof BeasiswaFormData,
    existKey: "existFotoDepan",
    label: "Depan",
    description: "Tampak Depan",
    hint: "Berdiri tegak, pandang lurus ke kamera",
    gradient: "from-blue-500/10 to-blue-600/5",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    key: "foto_samping_kiri" as keyof BeasiswaFormData,
    existKey: "existFotoSampingKiri",
    label: "Kiri",
    description: "Tampak Samping Kiri",
    hint: "Putar badan 90° ke kanan, pandang ke depan",
    gradient: "from-violet-500/10 to-violet-600/5",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    key: "foto_samping_kanan" as keyof BeasiswaFormData,
    existKey: "existFotoSampingKanan",
    label: "Kanan",
    description: "Tampak Samping Kanan",
    hint: "Putar badan 90° ke kiri, pandang ke depan",
    gradient: "from-emerald-500/10 to-emerald-600/5",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "foto_belakang" as keyof BeasiswaFormData,
    existKey: "existFotoBelakang",
    label: "Belakang",
    description: "Tampak Belakang",
    hint: "Berdiri tegak, membelakangi kamera",
    gradient: "from-amber-500/10 to-amber-600/5",
    badge: "bg-amber-100 text-amber-700",
  },
] as const;

interface FotoTambahanSectionProps {
  existFotoDepan?: string | null;
  existFotoSampingKiri?: string | null;
  existFotoSampingKanan?: string | null;
  existFotoBelakang?: string | null;
  errors: FieldErrors<BeasiswaFormData>;
  setValue: UseFormSetValue<BeasiswaFormData>;
}

// ── Lightbox ──────────────────────────────────────────────────────
interface LightboxImage {
  url: string;
  label: string;
  description: string;
}

interface LightboxProps {
  images: LightboxImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const Lightbox = ({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: LightboxProps) => {
  const current = images[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < images.length - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(activeIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(activeIndex + 1);
    },
    [activeIndex, hasPrev, hasNext, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ animation: "lbFadeIn 0.18s ease" }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/92 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 p-4">
        {/* Top bar */}
        <div className="flex w-full max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-white/10 px-3 py-1 text-sm font-semibold text-white">
              {current.description}
            </span>
            <span className="text-xs text-white/40">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Image + nav */}
        <div className="relative flex w-full max-w-3xl flex-1 items-center justify-center">
          <button
            type="button"
            onClick={() => hasPrev && onNavigate(activeIndex - 1)}
            disabled={!hasPrev}
            className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed">
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className="relative mx-14 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
            style={{ animation: "lbSlideUp 0.2s ease" }}
            key={activeIndex}>
            <img
              src={current.url}
              alt={current.label}
              className="max-h-[68vh] w-auto object-contain"
              style={{ maxWidth: "min(480px, 78vw)" }}
            />
          </div>

          <button
            type="button"
            onClick={() => hasNext && onNavigate(activeIndex + 1)}
            disabled={!hasNext}
            className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onNavigate(i)}
              className={`relative h-14 w-10 overflow-hidden rounded-lg border-2 transition-all ${
                i === activeIndex
                  ? "border-white scale-110 shadow-lg"
                  : "border-white/20 opacity-40 hover:opacity-70 hover:scale-105"
              }`}>
              <img
                src={img.url}
                alt={img.label}
                className="h-full w-full object-cover object-top"
              />
            </button>
          ))}
        </div>

        <p className="text-[11px] text-white/25">
          ← → navigasi &nbsp;·&nbsp; ESC tutup
        </p>
      </div>

      <style>{`
        @keyframes lbFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lbSlideUp { from { opacity: 0; transform: translateY(10px) scale(0.97) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const FotoTambahanSection = ({
  existFotoDepan,
  existFotoSampingKiri,
  existFotoSampingKanan,
  existFotoBelakang,
  errors,
  setValue,
}: FotoTambahanSectionProps) => {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const existFotoMap: Record<string, string | null | undefined> = {
    existFotoDepan,
    existFotoSampingKiri,
    existFotoSampingKanan,
    existFotoBelakang,
  };

  const totalUploaded = fotoTambahanConfig.filter(
    (f) => uploaded[f.key] || !!existFotoMap[f.existKey],
  ).length;

  const handleFotoChange = (key: keyof BeasiswaFormData, file: File | null) => {
    setValue(key, file ?? undefined, { shouldValidate: true });
    setUploaded((prev) => ({ ...prev, [key]: !!file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setPreviews((prev) => ({ ...prev, [key]: reader.result as string }));
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
  };

  // Lightbox images — hanya foto yang sudah ada, urut sesuai config
  const lightboxImages: LightboxImage[] = fotoTambahanConfig.reduce<
    LightboxImage[]
  >((acc, foto) => {
    const url = previews[foto.key] || existFotoMap[foto.existKey];
    if (url)
      acc.push({ url, label: foto.label, description: foto.description });
    return acc;
  }, []);

  // Dapatkan index lightbox dari card index
  const getLightboxIdx = (cardIdx: number): number | null => {
    const foto = fotoTambahanConfig[cardIdx];
    const url = previews[foto.key] || existFotoMap[foto.existKey];
    if (!url) return null;
    return lightboxImages.findIndex((img) => img.url === url);
  };

  return (
    <div className="space-y-4">
      {/* Lightbox */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* ── Header + Progress ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Foto Badan (4 Sisi)</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload 4 foto dari berbagai sudut pandang
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={totalUploaded === 4 ? "#34d399" : "#60a5fa"}
                  strokeWidth="2.5"
                  strokeDasharray={`${(totalUploaded / 4) * 100} 100`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              </svg>
              <span className="absolute text-sm font-bold text-white">
                {totalUploaded}/4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Foto</p>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          {[
            "Full badan kepala–kaki",
            "Latar belakang netral",
            "Pencahayaan cukup",
            "Format JPG / PNG",
          ].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4 Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        {fotoTambahanConfig.map((foto, idx) => {
          const existingUrl = existFotoMap[foto.existKey];
          const newPreview = previews[foto.key];
          const isUploaded = uploaded[foto.key] || !!existingUrl;
          const fieldError = errors[foto.key as keyof typeof errors] as
            | { message?: string }
            | undefined;
          const hasError = !!fieldError;
          const currentPreview = newPreview || existingUrl;
          const lbIdx = getLightboxIdx(idx);

          return (
            <div
              key={foto.key}
              className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                hasError
                  ? "border-red-300 bg-red-50/30"
                  : isUploaded
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
              }`}>
              {/* Card header */}
              <div
                className={`px-3 py-2.5 flex items-center justify-between bg-gradient-to-r ${foto.gradient}`}>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${foto.badge}`}>
                    {idx + 1}
                  </span>
                  <p className="text-xs font-semibold text-slate-700">
                    {foto.description}
                  </p>
                </div>
                {isUploaded && !hasError ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : hasError ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : null}
              </div>

              <div className="p-3 space-y-2.5">
                {/* Preview + hover actions */}
                {currentPreview && (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-100">
                    <img
                      src={currentPreview}
                      alt={foto.label}
                      className="w-full h-48 object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                      {/* View full */}
                      <button
                        type="button"
                        onClick={() =>
                          lbIdx !== null && setLightboxIndex(lbIdx)
                        }
                        className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <Maximize2 className="h-3.5 w-3.5" />
                        Lihat Full
                      </button>
                      {/* Ganti */}
                      <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                        <RefreshCw className="h-3 w-3" />
                        Ganti
                      </div>
                    </div>

                    {/* Zoom icon pojok kanan bawah */}
                    <button
                      type="button"
                      onClick={() => lbIdx !== null && setLightboxIndex(lbIdx)}
                      title="Lihat foto penuh"
                      className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110">
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>

                    {/* Badge baru */}
                    {newPreview && (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
                        Baru
                      </span>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {foto.hint}
                </p>

                <DropAndCropRectangle
                  name={foto.key}
                  onChange={(file) => handleFotoChange(foto.key, file)}
                  error={hasError}
                  errorMessage={fieldError?.message}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick view strip ── */}
      {lightboxImages.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-[11px] font-medium text-slate-500">
            Pratinjau cepat — klik untuk perbesar
          </p>
          <div className="flex gap-2">
            {lightboxImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                title={img.description}
                className="group relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5">
                <img
                  src={img.url}
                  alt={img.label}
                  className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-1">
                  <span className="text-[9px] font-semibold leading-tight text-white">
                    {img.label}
                  </span>
                </div>
                {/* Zoom icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-4 w-4 text-white drop-shadow" />
                </div>
              </button>
            ))}

            {/* Tombol lihat semua */}
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="flex h-16 w-12 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-all hover:border-slate-400 hover:text-slate-600 hover:-translate-y-0.5">
              <Maximize2 className="h-4 w-4" />
              <span className="text-[9px] font-medium">Semua</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Banner selesai ── */}
      {totalUploaded === 4 && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">
            Semua foto berhasil diupload! Pastikan kualitas foto sudah sesuai.
          </p>
        </div>
      )}
    </div>
  );
};

export default FotoTambahanSection;
