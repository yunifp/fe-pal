import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";

interface KlusterSelectorProps {
  idTrxBeasiswa: number;
  currentKluster?: number | null;
}

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="ml-auto shrink-0">
    <circle cx="8" cy="8" r="7.5" fill="currentColor" />
    <path
      d="M5 8l2.2 2.2L11 5.5"
      stroke="#fff"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    className="shrink-0">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" />
    <path
      d="M8 7v4M8 5.5v.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const SavedIcon = ({ color }: { color: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    className="shrink-0">
    <circle cx="8" cy="8" r="7.5" fill={color} />
    <path
      d="M5 8l2.2 2.2L11 5.5"
      stroke="#fff"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Daftar dokumen dummy untuk Afirmasi
const DOKUMEN_AFIRMASI = [
  { id: 1, label: "Surat Keterangan Tidak Mampu (SKTM)" },
  { id: 2, label: "Surat Keterangan Domisili Daerah 3T" },
  { id: 3, label: "Surat Rekomendasi Dinas" },
];

const KlusterSelector = ({
  idTrxBeasiswa,
  currentKluster,
}: KlusterSelectorProps) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number | null>(
    currentKluster ?? null,
  );

  // Dummy state untuk file upload
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<number, string | null>
  >({});

  const mutation = useMutation({
    mutationFn: (id_kluster: number) =>
      beasiswaService.updateKluster(idTrxBeasiswa, id_kluster),
    onSuccess: (_, id_kluster) => {
      setSelected(id_kluster);
      queryClient.invalidateQueries({
        queryKey: ["full-data-beasiswa", idTrxBeasiswa],
      });
      toast.success(
        `Kluster diubah menjadi ${id_kluster === 1 ? "Reguler" : "Afirmasi"}`,
      );
    },
    onError: () => {
      toast.error("Gagal mengubah kluster.");
    },
  });

  const isLoading = mutation.isPending;

  const options = [
    {
      id: 1,
      label: "Reguler",
      activeStyle: "border-[#185FA5] bg-[#E6F1FB]",
      dotColor: "bg-[#185FA5]",
      labelColor: "text-[#0C447C]",
      iconColor: "text-[#185FA5]",
      iconHex: "#185FA5",
      hintColor: "text-[#185FA5]",
    },
    {
      id: 2,
      label: "Afirmasi",
      activeStyle: "border-[#854F0B] bg-[#FAEEDA]",
      dotColor: "bg-[#854F0B]",
      labelColor: "text-[#633806]",
      iconColor: "text-[#854F0B]",
      iconHex: "#854F0B",
      hintColor: "text-[#854F0B]",
    },
  ];

  const activeOption = options.find((o) => o.id === selected);

  // Dummy handler — belum ada fungsi nyata
  const handleFileChange = (dokumenId: number, fileName: string | null) => {
    setUploadedFiles((prev) => ({ ...prev, [dokumenId]: fileName }));
    if (fileName) {
      toast.info(`"${fileName}" dipilih (fitur upload belum aktif)`);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 w-full">
      {/* Label */}
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        Kluster pendaftar
      </p>

      {/* Tombol pilihan */}
      <div className="flex gap-2">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          const isOther = selected !== null && selected !== opt.id;

          return (
            <button
              key={opt.id}
              disabled={isLoading}
              onClick={() => {
                if (!isLoading && selected !== opt.id) {
                  mutation.mutate(opt.id);
                }
              }}
              className={[
                "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all duration-150",
                isActive
                  ? `border-[1.5px] ${opt.activeStyle}`
                  : "border-border bg-muted/40 hover:bg-muted hover:border-border/60",
                isOther ? "opacity-50" : "",
                isLoading ? "cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}>
              <span
                className={[
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  isActive ? opt.dotColor : "bg-muted-foreground/30",
                ].join(" ")}
              />
              <span
                className={[
                  "text-[13px] font-medium",
                  isActive ? opt.labelColor : "text-muted-foreground",
                ].join(" ")}>
                {opt.label}
              </span>
              {isActive && (
                <span className={["ml-auto", opt.iconColor].join(" ")}>
                  <CheckIcon />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hint / status */}
      <div
        className={[
          "flex items-center gap-1.5 text-[11px]",
          activeOption ? activeOption.hintColor : "text-muted-foreground",
        ].join(" ")}>
        {activeOption ? (
          <>
            <SavedIcon color={activeOption.iconHex} />
            Tersimpan sebagai {activeOption.label}
          </>
        ) : (
          <>
            <InfoIcon />
            Pilih kluster untuk pendaftar ini
          </>
        )}
      </div>

      {/* ===================== */}
      {/* Dokumen Afirmasi (dummy) */}
      {/* ===================== */}
      {selected === 2 && (
        <div className="mt-1 flex flex-col gap-2 rounded-lg border border-[#854F0B]/20 bg-[#FAEEDA]/40 px-3 py-3">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-3.5 w-3.5 text-[#854F0B]" />
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#854F0B]">
              Dokumen pendukung afirmasi
            </p>
            <span className="ml-auto text-[10px] text-[#854F0B]/60 italic">
              Segera hadir
            </span>
          </div>

          {DOKUMEN_AFIRMASI.map((dok) => {
            const uploadedFile = uploadedFiles[dok.id];

            return (
              <div
                key={dok.id}
                className="flex items-center gap-3 rounded-lg border border-[#854F0B]/15 bg-white/60 px-3 py-2.5">
                {/* Info dokumen */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#633806] truncate">
                    {dok.label}
                  </p>
                  {uploadedFile ? (
                    <p className="text-[11px] text-[#854F0B] mt-0.5 truncate">
                      {uploadedFile}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Belum ada dokumen
                    </p>
                  )}
                </div>

                {/* Tombol upload dummy */}
                {uploadedFile ? (
                  <button
                    onClick={() => handleFileChange(dok.id, null)}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors cursor-not-allowed opacity-60"
                    title="Fitur belum aktif">
                    <X className="h-3 w-3" />
                    Hapus
                  </button>
                ) : (
                  <label
                    className="flex shrink-0 items-center gap-1 rounded-md border border-[#854F0B]/30 bg-[#FAEEDA] px-2.5 py-1 text-[11px] font-medium text-[#633806] cursor-not-allowed opacity-60 transition-colors"
                    title="Fitur belum aktif">
                    <Upload className="h-3 w-3" />
                    Upload
                    {/* Input disabled — dummy */}
                    <input type="file" className="hidden" disabled />
                  </label>
                )}
              </div>
            );
          })}

          <p className="text-[10px] text-[#854F0B]/50 italic mt-1">
            * Fitur upload dokumen afirmasi sedang dalam pengembangan
          </p>
        </div>
      )}
    </div>
  );
};

export default KlusterSelector;
