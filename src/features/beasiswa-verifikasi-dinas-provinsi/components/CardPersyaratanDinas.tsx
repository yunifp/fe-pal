import { ChevronDown, FileText, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { FC } from "react";
import type { ITrxDokumenDinas } from "@/types/beasiswa"; // ← Import tipe yang sudah ada

interface CardPersyaratanDinasProps {
  data: ITrxDokumenDinas[]; // ← Ganti menggunakan tipe yang sudah ada
}

const CardPersyaratanDinas: FC<CardPersyaratanDinasProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(true);

  // ✅ Update formatDate untuk handle null
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between hover:from-purple-600 hover:to-purple-700 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">
              Dokumen dari Dinas
            </h3>
            <p className="text-purple-100 text-sm">
              {data.length} dokumen tersedia
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content - Collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}>
        <div className="p-6 space-y-4">
          {data.map((dokumen, index) => (
            <div
              key={dokumen.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50">
              {/* Document Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {dokumen.nama_dokumen_persyaratan}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">
                    Diunggah: {formatDate(dokumen.timestamp)}
                  </p>
                </div>

                {/* View Button */}

                {/* View Button */}
                {dokumen.file ? (
                  <a
                    href={dokumen.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Lihat
                  </a>
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed">
                    <ExternalLink className="w-4 h-4" />
                    Tidak Tersedia
                  </span>
                )}
              </div>

              {/* Document Info */}
              <div className="ml-8 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">ID Dokumen:</span>
                  <span className="font-medium text-gray-700">
                    {dokumen.id_ref_dokumen}
                  </span>
                </div>

                {/* Verifikator Info (if available) - sesuaikan dengan field yang ada */}
                {dokumen.verifikator_dinas_timestamp && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Status Verifikasi Dinas:
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">
                        Diverifikasi pada{" "}
                        {formatDate(dokumen.verifikator_dinas_timestamp)}
                      </span>
                    </div>
                    {dokumen.verifikator_dinas_catatan && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        "{dokumen.verifikator_dinas_catatan}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardPersyaratanDinas;
