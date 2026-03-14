import { BadgeStatusTransfer } from "@/components/pks/BadgeStatusTransfer";
import { Button } from "@/components/ui/button";
import type { ITrxBiayaPendidikanPksWithPks } from "@/types/biayaPendidikan";
import type { ColumnDef } from "@tanstack/react-table";
import { BookUser, FileCheck, FileText } from "lucide-react";
import { BadgeFlowLembagaPendidikan } from "@/components/pks/BadgeFlowLembagaPendidikan";
import { formatRupiah } from "@/utils/stringFormatter";
import { BadgeSubFlowLembagaPendidikan } from "@/components/pks/BadgeSubFlowLembagaPendidikan";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getColumnsBiayaPendidikan =
  (): ColumnDef<ITrxBiayaPendidikanPksWithPks>[] => [
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
        <div className="whitespace-normal break-words">
          {getValue<string>()}
        </div>
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
      cell: ({ row }) => (
        <div className="flex gap-1">
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
                    href={row.original.file_daftar_nominatif!!}
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
                    href={row.original.file_surat_penagihan!!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookUser className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-inter">
                <p>Surat Penagihan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                    href={row.original.file_laporan_kegiatan_semester!!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileCheck className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-inter">
                <p>Laporan Kegiatan Semester</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-2">
          {row.original.id_status != 2 && (
            <BadgeFlowLembagaPendidikan flow={row.original.status!!} />
          )}
          {row.original.id_status == 2 && (
            <BadgeSubFlowLembagaPendidikan
              subFlow={row.original.sub_status!!}
            />
          )}
        </div>
      ),
    },
    {
      header: "Status Transfer",
      cell: ({ row }) => (
        <BadgeStatusTransfer status={row.original.status_transfer} />
      ),
    },
  ];
