import { Button } from "@/components/ui/button";
import type { ITrxBiayaHidupPksWithPks } from "@/types/biayaHidup";
import type { ColumnDef } from "@tanstack/react-table";
import { FileSpreadsheet } from "lucide-react";
import { BadgeFlowLembagaPendidikan } from "@/components/pks/BadgeFlowLembagaPendidikan";
import { formatRupiah } from "@/utils/stringFormatter";
import { BadgeSubFlowLembagaPendidikan } from "@/components/pks/BadgeSubFlowLembagaPendidikan";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getColumnsBiayaHidup =
  (): ColumnDef<ITrxBiayaHidupPksWithPks>[] => [
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
      accessorKey: "bulan",
      header: "Bulan",
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
          </div>
        );
      },
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
  ];
