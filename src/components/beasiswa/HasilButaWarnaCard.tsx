import { AlertCircle, CheckCircle2 } from "lucide-react";

interface HasilButaWarnaCardProps {
  kondisiButaWarna: string | undefined | null;
}

export const HasilButaWarnaCard = ({
  kondisiButaWarna,
}: HasilButaWarnaCardProps) => {
  if (!kondisiButaWarna || kondisiButaWarna === "") {
    return null;
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${
        kondisiButaWarna === "N"
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}>
      <div className="flex-shrink-0 mt-0.5">
        {kondisiButaWarna === "N" ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
      </div>
      <div className="flex-1">
        <h4
          className={`font-medium ${
            kondisiButaWarna === "N" ? "text-green-900" : "text-red-900"
          }`}>
          {kondisiButaWarna === "N"
            ? "Penglihatan Normal"
            : "Terdeteksi Buta Warna"}
        </h4>
        <p
          className={`text-sm mt-1 ${
            kondisiButaWarna === "N" ? "text-green-700" : "text-red-700"
          }`}>
          {kondisiButaWarna === "N"
            ? "Hasil tes menunjukkan tidak ada indikasi buta warna."
            : "Hasil tes menunjukkan adanya indikasi buta warna. Disarankan untuk konsultasi lebih lanjut."}
        </p>
      </div>
    </div>
  );
};
