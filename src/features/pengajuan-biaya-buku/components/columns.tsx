import { Button } from "@/components/ui/button";
import useHasAccess from "@/hooks/useHasAccess";
import type { BatchItem, ITrxBiayaBukuPksWithPks } from "@/types/biayaBuku";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  CheckCircle,
  FileSpreadsheet,
  Info,
  LogsIcon,
  MoreHorizontal,
  ReceiptText,
  RotateCcw,
  Trash,
} from "lucide-react";
import { BadgeFlowLembagaPendidikan } from "@/components/pks/BadgeFlowLembagaPendidikan";
import { formatRupiah } from "@/utils/stringFormatter";
import { BadgeSubFlowLembagaPendidikan } from "@/components/pks/BadgeSubFlowLembagaPendidikan";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { biayaBukuService } from "@/services/biayaBukuService";
import { toast } from "sonner";
import { formatTanggalJamIndo } from "@/utils/dateFormatter";

const handleDownloadRab = async (idBiayaBuku: number) => {
  try {
    const blob = await biayaBukuService.generateRab(idBiayaBuku);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "RAB-Biaya-Buku.pdf";
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    toast.error("Gagal mengunduh RAB");
  }
};

type GetColumnsProps = {
  onShowMahasiswa: (idTrxPks: number) => void;
  onAjukanBpdp: (idPengajuan: number) => void;
  onRevisiVerifikator: (biayaBuku: ITrxBiayaBukuPksWithPks) => void;
  onStaffBeasiswa: (biayaBuku: ITrxBiayaBukuPksWithPks) => void;
  onVerifikatorPjk: (biayaBuku: ITrxBiayaBukuPksWithPks) => void;
  onShowLog: (biayaBuku: ITrxBiayaBukuPksWithPks) => void;
  onDelete: (idPengajuan: number) => void;

  selectedBatch: BatchItem[];
  setSelectedBatch: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  isLembagaPendidikanAdministrator: boolean;
  isLembagaPendidikanVerifikator: boolean;
  isStaffDivisiBeasiswa: boolean;
  isVerifikatorPjk: boolean;
};

export const getColumns = ({
  onShowMahasiswa: _,
  onAjukanBpdp,
  onRevisiVerifikator,
  onStaffBeasiswa,
  onVerifikatorPjk,
  onShowLog,
  onDelete,

  isLembagaPendidikanAdministrator,
  isLembagaPendidikanVerifikator,
  isStaffDivisiBeasiswa,
  isVerifikatorPjk,
}: GetColumnsProps): ColumnDef<ITrxBiayaBukuPksWithPks>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "tahun",
    header: "Tahun",
  },
  {
    accessorKey: "semester",
    header: "Semester",
  },
  {
    accessorKey: "lembaga_pendidikan",
    header: "Lembaga Pendidikan",
    cell: ({ getValue }) => (
      <div className="whitespace-normal break-words">{getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "jenjang",
    header: "Jenjang",
  },
  {
    header: "Jumlah Mahasiswa",
    accessorKey: "total_mahasiswa",
  },
  {
    header: "Mahasiswa Aktif",
    accessorKey: "total_mahasiswa_aktif",
  },
  {
    header: "Total Biaya",
    cell: ({ row }) => formatRupiah(row.original.jumlah!!),
  },
  {
    header: "Dokumen",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex gap-1">
          {/* Daftar Nominatif */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <a
                    href={data.file_daftar_nominatif!!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-inter">
                <p>Daftar Nominatif</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* RAB (conditional) */}
          {data.id_status === 2 && data.id_sub_status === 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownloadRab(data.id)}
                  >
                    <ReceiptText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-inter">
                  <p>File RAB</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const { id_status, status, sub_status } = row.original;

      const isOperatorOrVerifikator =
        isLembagaPendidikanAdministrator || isLembagaPendidikanVerifikator;

      return (
        <div className="flex flex-col items-start gap-2">
          {isOperatorOrVerifikator ? (
            <BadgeFlowLembagaPendidikan flow={status!} />
          ) : id_status === 2 ? (
            <BadgeSubFlowLembagaPendidikan subFlow={sub_status!} />
          ) : (
            <BadgeFlowLembagaPendidikan flow={status!} />
          )}
        </div>
      );
    },
  },
  {
    header: "Diajukan Oleh",
    cell: ({ row }) => {
      const { diajukan_ke_verifikator_by, diajukan_ke_verifikator_at } =
        row.original;

      if (!diajukan_ke_verifikator_by) return "-";

      return (
        <div className="flex flex-col">
          <span className="font-medium">{diajukan_ke_verifikator_by}</span>
          <span className="text-xs text-gray-500">
            {formatTanggalJamIndo(diajukan_ke_verifikator_at!!)}
          </span>
        </div>
      );
    },
  },
  {
    header: "Diverifikasi PPK",
    cell: ({ row }) => {
      const { diverifikasi_ppk_by, diverifikasi_ppk_at } = row.original;

      if (!diverifikasi_ppk_by) return "-";

      return (
        <div className="flex flex-col">
          <span className="font-medium">{diverifikasi_ppk_by}</span>
          <span className="text-xs text-gray-500">
            {formatTanggalJamIndo(diverifikasi_ppk_at!!)}
          </span>
        </div>
      );
    },
  },
  {
    header: "Diverifikasi Bendahara",
    cell: ({ row }) => {
      const { diverifikasi_bendahara_by, diverifikasi_bendahara_at } =
        row.original;

      if (!diverifikasi_bendahara_by) return "-";

      return (
        <div className="flex flex-col">
          <span className="font-medium">{diverifikasi_bendahara_by}</span>
          <span className="text-xs text-gray-500">
            {formatTanggalJamIndo(diverifikasi_bendahara_at!!)}
          </span>
        </div>
      );
    },
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const canUpdate = useHasAccess("U");
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-inter space-y-0.5">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>

            {canUpdate &&
              (row.original.id_status == 1 || row.original.id_status == 4) && (
                <DropdownMenuItem
                  onClick={() => onAjukanBpdp(row.original.id!!)}
                >
                  <Check className="h-4 w-4 mr-1" /> Verifikasi
                </DropdownMenuItem>
              )}
            {isLembagaPendidikanAdministrator &&
              row.original.id_status == 3 && (
                <DropdownMenuItem
                  onClick={() => onRevisiVerifikator(row.original!!)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> Revisi
                </DropdownMenuItem>
              )}
            {isStaffDivisiBeasiswa &&
              row.original.id_status == 2 &&
              row.original.id_sub_status == 1 && (
                <DropdownMenuItem
                  onClick={() => onStaffBeasiswa(row.original!!)}
                >
                  <Info className="h-4 w-4 mr-1" /> Detail
                </DropdownMenuItem>
              )}
            {isVerifikatorPjk &&
              row.original.id_status == 2 &&
              row.original.id_sub_status == 2 && (
                <DropdownMenuItem
                  onClick={() => onVerifikatorPjk(row.original!!)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approval RAB
                </DropdownMenuItem>
              )}
            {!(
              isLembagaPendidikanAdministrator || isLembagaPendidikanVerifikator
            ) && (
              <DropdownMenuItem
                onClick={() => row.original && onShowLog(row.original)}
              >
                <LogsIcon className="h-4 w-4 mr-1" /> Log Pengajuan
              </DropdownMenuItem>
            )}

            {isLembagaPendidikanAdministrator &&
              row.original.id_status == 3 && (
                <DropdownMenuItem
                  onClick={() => row.original && onDelete(row.original.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Hapus
                </DropdownMenuItem>
              )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
