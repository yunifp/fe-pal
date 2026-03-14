import { CheckCircle, ArrowRight, Clock, FileText } from "lucide-react";

const AlertSudahLulusAdministrasi = () => {
  return (
    <div className="border-1 border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50 p-5 shadow-none">
      {/* Header dengan Badge */}
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title with Badge */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-purple-900">
              Selamat! Anda Lulus Verifikasi Administrasi
            </h3>
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              ✓ Terverifikasi
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-purple-800 mb-4 leading-relaxed">
            Berkas administrasi Anda telah diverifikasi dan dinyatakan{" "}
            <span className="font-semibold">memenuhi persyaratan</span>. Untuk
            melanjutkan proses seleksi beasiswa, silakan lengkapi data tagging
            di bawah ini.
          </p>

          {/* Steps */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 text-sm text-purple-700">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
              <span>
                <span className="font-semibold">Langkah Selanjutnya:</span> Isi
                form data tagging untuk melengkapi profil Anda
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-purple-700">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
              <span>
                <span className="font-semibold">Data yang diperlukan:</span>{" "}
                Informasi tambahan untuk proses seleksi tahap berikutnya
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-purple-700">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
              <span>
                <span className="font-semibold">Penting:</span> Pastikan data
                yang Anda isi akurat dan lengkap
              </span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex items-center gap-2 p-3 bg-white rounded-md border border-purple-200">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-purple-900 font-medium">
              Silakan scroll ke bawah dan lengkapi form data tagging untuk
              melanjutkan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertSudahLulusAdministrasi;
