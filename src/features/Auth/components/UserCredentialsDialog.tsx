import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface UserCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  pin: string;
}

const UserCredentialsDialog: React.FC<UserCredentialsDialogProps> = ({
  open,
  onOpenChange,
  userId,
  pin,
}) => {
  const [showPin, setShowPin] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white dark:bg-slate-800 border-0 shadow-2xl font-inter"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            Pendaftaran Berhasil!
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-center">
            Akun Anda telah berhasil dibuat. Simpan kredensial berikut untuk
            login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Warning Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Penting!
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Simpan kredensial ini dengan aman. Jangan bagikan kepada siapa
                pun. Anda memerlukan User ID dan PIN untuk login ke akun Anda.
              </p>
            </div>
          </div>

          {/* User ID Card */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-4 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>

            <div className="relative">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                User ID
              </label>
              <div className="flex items-center justify-between mt-2 gap-3">
                <span className="text-lg font-mono font-semibold text-slate-900 dark:text-white break-all">
                  {userId}
                </span>
                <button
                  onClick={() => copyToClipboard(userId, "userId")}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm flex-shrink-0"
                  title="Copy User ID"
                >
                  {copiedField === "userId" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* PIN Card */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-600 dark:to-slate-700 p-4 transition-all duration-300 hover:shadow-lg">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"></div>

            <div className="relative">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                PIN
              </label>
              <div className="flex items-center justify-between mt-2 gap-3">
                <span className="text-lg font-mono font-semibold text-slate-900 dark:text-white">
                  {showPin ? pin : "••••••"}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    title={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(pin, "pin")}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    title="Copy PIN"
                  >
                    {copiedField === "pin" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserCredentialsDialog;
