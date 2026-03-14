import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  ServerCrash,
  ShieldOff,
  FileSearch,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ErrorType =
  | "network"
  | "server"
  | "not_found"
  | "forbidden"
  | "timeout"
  | "unknown";

export type ErrorSize = "sm" | "md" | "lg" | "full";
export type ErrorVariant = "card" | "inline" | "overlay" | "minimal";

export interface ErrorStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  icon?: React.ReactNode;
}

export interface ErrorStateProps {
  /** Type of error - controls icon, title, and default message */
  type?: ErrorType;
  /** Custom title override */
  title?: string;
  /** Custom message override */
  message?: string;
  /** HTTP status code or error code to display */
  code?: string | number;
  /** Technical error details (shown in expandable section) */
  detail?: string;
  /** Primary retry callback */
  onRetry?: () => void;
  /** Go back callback */
  onBack?: () => void;
  /** Go home callback */
  onHome?: () => void;
  /** Additional custom actions */
  actions?: ErrorStateAction[];
  /** Visual size variant */
  size?: ErrorSize;
  /** Layout variant */
  variant?: ErrorVariant;
  /** Loading state for retry button */
  retrying?: boolean;
  /** Custom class names */
  className?: string;
  /** Hide the icon */
  hideIcon?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ERROR_CONFIG: Record<
  ErrorType,
  {
    icon: React.ReactNode;
    title: string;
    message: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  network: {
    icon: <WifiOff />,
    title: "Koneksi Terputus",
    message:
      "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  server: {
    icon: <ServerCrash />,
    title: "Server Error",
    message:
      "Terjadi kesalahan pada server. Tim kami sedang bekerja untuk memperbaikinya.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  not_found: {
    icon: <FileSearch />,
    title: "Data Tidak Ditemukan",
    message: "Data yang Anda cari tidak tersedia atau mungkin telah dihapus.",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
  },
  forbidden: {
    icon: <ShieldOff />,
    title: "Akses Ditolak",
    message: "Anda tidak memiliki izin untuk mengakses data ini.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  timeout: {
    icon: <Clock />,
    title: "Waktu Habis",
    message:
      "Permintaan membutuhkan waktu terlalu lama. Server mungkin sedang sibuk.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  unknown: {
    icon: <AlertTriangle />,
    title: "Terjadi Kesalahan",
    message: "Sesuatu yang tidak terduga terjadi. Silakan coba lagi.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
};

const SIZE_CONFIG: Record<
  ErrorSize,
  { wrapper: string; icon: string; title: string; message: string; gap: string }
> = {
  sm: {
    wrapper: "p-4",
    icon: "w-8 h-8",
    title: "text-sm font-semibold",
    message: "text-xs",
    gap: "gap-3",
  },
  md: {
    wrapper: "p-6",
    icon: "w-12 h-12",
    title: "text-base font-semibold",
    message: "text-sm",
    gap: "gap-4",
  },
  lg: {
    wrapper: "p-10",
    icon: "w-16 h-16",
    title: "text-xl font-bold",
    message: "text-base",
    gap: "gap-5",
  },
  full: {
    wrapper: "p-16",
    icon: "w-20 h-20",
    title: "text-2xl font-bold",
    message: "text-base",
    gap: "gap-6",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ErrorState({
  type = "unknown",
  title,
  message,
  code,
  detail,
  onRetry,
  onBack,
  onHome,
  actions = [],
  size = "md",
  variant = "card",
  retrying = false,
  className,
  hideIcon = false,
}: ErrorStateProps) {
  const [showDetail, setShowDetail] = useState(false);

  const config = ERROR_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];

  const displayTitle = title ?? config.title;
  const displayMessage = message ?? config.message;

  const isCard = variant === "card";
  const isInline = variant === "inline";
  const isMinimal = variant === "minimal";
  const isOverlay = variant === "overlay";

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        sizeConfig.wrapper,
        sizeConfig.gap,

        // Variant styles
        isCard &&
          cn(
            "rounded-2xl border",
            config.bgColor,
            config.borderColor,
            "backdrop-blur-sm shadow-sm",
          ),
        isInline &&
          cn(
            "rounded-xl border flex-row text-left items-start",
            config.bgColor,
            config.borderColor,
          ),
        isOverlay &&
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-md justify-center",
        isMinimal && "bg-transparent",

        className,
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {!hideIcon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl shrink-0",
            isInline ? "mt-0.5" : "",
            config.color,
            // icon background
            "bg-white/10 dark:bg-white/5",
            sizeConfig.icon === "w-8 h-8"
              ? "p-2 rounded-xl"
              : sizeConfig.icon === "w-12 h-12"
                ? "p-3"
                : "p-4",
          )}
          style={{ animationDuration: "3s" }}
        >
          <span
            className={cn(sizeConfig.icon, config.color, "animate-pulse")}
            style={{ animationDuration: "3s" }}
          >
            {config.icon}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "flex flex-col",
          isInline ? "items-start text-left gap-1" : "items-center gap-2",
        )}
      >
        {/* Badge code */}
        {code && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono tabular-nums",
              config.color,
              config.borderColor,
            )}
          >
            {code}
          </Badge>
        )}

        {/* Title */}
        <h3 className={cn(sizeConfig.title, "text-foreground")}>
          {displayTitle}
        </h3>

        {/* Message */}
        <p
          className={cn(
            sizeConfig.message,
            "text-muted-foreground leading-relaxed max-w-sm",
          )}
        >
          {displayMessage}
        </p>

        {/* Technical detail collapsible */}
        {detail && (
          <div className="w-full mt-1">
            <button
              onClick={() => setShowDetail((v) => !v)}
              className={cn(
                "flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors",
                isInline ? "" : "mx-auto",
              )}
            >
              {showDetail ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {showDetail ? "Sembunyikan detail" : "Lihat detail teknis"}
            </button>
            {showDetail && (
              <pre
                className={cn(
                  "mt-2 p-3 rounded-lg text-left text-xs font-mono break-all whitespace-pre-wrap",
                  "bg-black/10 dark:bg-white/5 text-muted-foreground border",
                  config.borderColor,
                )}
              >
                {detail}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {(onRetry || onBack || onHome || actions.length > 0) && (
        <div
          className={cn(
            "flex flex-wrap gap-2",
            isInline ? "flex-row" : "justify-center",
          )}
        >
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={retrying}
              size={size === "sm" ? "sm" : "default"}
              className={cn(
                "gap-2 font-medium",
                // Subtle color accent on primary button
                "bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              <RefreshCw
                className={cn("w-4 h-4", retrying && "animate-spin")}
              />
              {retrying ? "Mencoba ulang…" : "Coba Lagi"}
            </Button>
          )}

          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size={size === "sm" ? "sm" : "default"}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          )}

          {onHome && (
            <Button
              onClick={onHome}
              variant="ghost"
              size={size === "sm" ? "sm" : "default"}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Beranda
            </Button>
          )}

          {actions.map((action, i) => (
            <Button
              key={i}
              onClick={action.onClick}
              variant={action.variant ?? "outline"}
              size={size === "sm" ? "sm" : "default"}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
