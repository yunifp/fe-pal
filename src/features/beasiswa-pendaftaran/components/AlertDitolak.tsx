import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

interface AlertDitolakProps {
  catatan?: string;
}

const AlertDitolak = ({ catatan }: AlertDitolakProps) => {
  return (
    <Alert className="border-red-500 bg-gradient-to-br from-red-50 to-rose-50">
      <XCircle className="h-5 w-5 text-red-600" strokeWidth={2.5} />
      <AlertTitle className="font-semibold text-red-900 text-base">
        Pengajuan Ditolak
      </AlertTitle>
      <AlertDescription className="text-red-800 space-y-3">
        <p className="leading-relaxed">
          Mohon maaf, pengajuan beasiswa Anda tidak dapat diproses lebih lanjut.
          Silakan periksa catatan dari verifikator untuk informasi lebih detail.
        </p>

        {catatan && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="font-medium text-red-900 mb-2 text-sm">
              Alasan Penolakan:
            </p>
            <div className="bg-white/60 rounded-lg p-3 border border-red-200">
              <p className="text-sm text-red-900 whitespace-pre-wrap leading-relaxed">
                {catatan}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-red-200">
          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-red-500 mt-2"></div>
          <p className="text-sm text-red-700">
            Anda dapat mengajukan beasiswa kembali pada periode selanjutnya
            dengan memperhatikan persyaratan yang berlaku.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AlertDitolak;
