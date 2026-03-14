import { Button } from "@/components/ui/button";
import useHasAccess from "@/hooks/useHasAccess";
import type { ITrxBiayaTransportasiPksWithPks } from "@/types/biayaTransportasi";
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
  FileSignature,
  FileText,
  Info,
  LogsIcon,
  MoreHorizontal,
  Receipt,
  RotateCcw,
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
import { biayaTransportasiService } from "@/services/biayaTransportasiService";
import { toast } from "sonner";
import { formatTanggalJamIndo } from "@/utils/dateFormatter";

const handleDownloadRab = async (idBiayaTransportasi: number) => {
  try {
    const blob =
      await biayaTransportasiService.generateRab(idBiayaTransportasi);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "RAB-Biaya-Transportasi.pdf";
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
  onRevisiVerifikator: (
    biayaTransportasi: ITrxBiayaTransportasiPksWithPks,
  ) => void;
  onStaffBeasiswa: (biayaTransportasi: ITrxBiayaTransportasiPksWithPks) => void;
  onVerifikatorPjk: (
    biayaTransportasi: ITrxBiayaTransportasiPksWithPks,
  ) => void;
  onShowLog: (biayaTransportasi: ITrxBiayaTransportasiPksWithPks) => void;

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

  isLembagaPendidikanAdministrator,
  isLembagaPendidikanVerifikator,
  isStaffDivisiBeasiswa,
  isVerifikatorPjk,
}: GetColumnsProps): ColumnDef<ITrxBiayaTransportasiPksWithPks>[] => [
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
    accessorKey: "tahap",
    header: "Tahap",
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
    header: "Mahasiswa",
    accessorKey: "total_mahasiswa",
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
                    <FileText className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-inter">
                <p>Daftar Nominatif</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* SPTJM */}
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
                    href={data.file_sptjm!!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileSignature className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-inter">
                <p>Surat Pernyataan Tanggung Jawab Mutlak</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Bukti Kwitansi */}
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
                    href={data.file_bukti_kwitansi!!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Receipt className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-inter">
                <p>Bukti Kwitansi</p>
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
                    <FileText className="h-4 w-4" />
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
            {/* <DropdownMenuItem
              onClick={() =>
                row.original.id_trx_pks &&
                onShowMahasiswa(row.original.id_trx_pks)
              }
            >
              <Users className="h-4 w-4 mr-1" /> Lihat Mahasiswa
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => row.original && onShowLog(row.original)}
            >
              <LogsIcon className="h-4 w-4 mr-1" /> Log Pengajuan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
