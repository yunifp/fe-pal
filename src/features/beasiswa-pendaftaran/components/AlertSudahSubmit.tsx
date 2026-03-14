import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const AlertSudahSubmit = () => {
  return (
    <Alert className="border-blue-500 text-blue-700 bg-blue-50">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertTitle className="font-semibold">Informasi</AlertTitle>
      <AlertDescription>
        Anda telah men-submit data pada beasiswa ini. Mohon tunggu verifikator
        untuk memverifikasi pengajuan Anda.
      </AlertDescription>
    </Alert>
  );
};

export default AlertSudahSubmit;
