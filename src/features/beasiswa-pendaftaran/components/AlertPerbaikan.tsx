import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AlertPerbaikanProps {
  catatan?: string;
}

const AlertPerbaikan = ({ catatan }: AlertPerbaikanProps) => {
  return (
    <Alert className="border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50">
      <AlertCircle className="h-5 w-5 text-amber-600" strokeWidth={2.5} />
      <AlertTitle className="font-semibold text-amber-900 text-base">
        Perlu Perbaikan
      </AlertTitle>
      <AlertDescription className="text-amber-800 space-y-3">
        <p className="leading-relaxed">
          Pengajuan beasiswa Anda memerlukan perbaikan. Silakan periksa catatan
          verifikator dan lakukan perbaikan sesuai dengan arahan yang diberikan.
        </p>

        {catatan && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="font-medium text-amber-900 mb-2 text-sm">
              Catatan Verifikator:
            </p>
            <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
              <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                {catatan}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-amber-200">
          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-amber-500 mt-2"></div>
          <p className="text-sm text-amber-700">
            Setelah melakukan perbaikan, silakan submit ulang pengajuan Anda.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AlertPerbaikan;
