import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthRole } from "@/hooks/useAuthRole";
import type { IBatchBiayaHidupPks } from "@/types/biayaHidup";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, List, MoreHorizontal } from "lucide-react";
import { DownloadNominatifButton } from "./DownloadNominatifButton";
import { DownloadRekapButton } from "./DownloadRekap";

interface GetColumnsProps {
  onShowList: (idBatch: number) => void;
  onShowVerifikasi: (idBatch: number) => void;
}

export const getColumns = ({
  onShowList,
  onShowVerifikasi,
}: GetColumnsProps): ColumnDef<IBatchBiayaHidupPks>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "kode_batch",
    header: "Kode Batch",
    accessorKey: "nama",
  },
  {
    id: "bulan",
    header: "Bulan",
    accessorKey: "bulan",
  },
  {
    id: "tahun",
    header: "Tahun",
    accessorKey: "tahun",
  },
  {
    id: "jenjang",
    header: "Jenjang",
    accessorKey: "jenjang",
  },
  {
    id: "file_daftar_nominatif",
    header: "Daftar Nominatif Gabungan",
    cell: ({ row }) => {
      return <DownloadNominatifButton idBatch={row.original.id} />;
    },
  },

  {
    id: "file_rekap",
    header: "Rekapitulasi",
    cell: ({ row }) => {
      return <DownloadRekapButton idBatch={row.original.id} />;
    },
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const { isPpk, isBendahara } = useAuthRole();
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
            {isPpk && row.original.ttd_nominatif_ppk == null && (
              <DropdownMenuItem
                onClick={() =>
                  row.original.id && onShowVerifikasi(row.original.id)
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Verifikasi
              </DropdownMenuItem>
            )}

            {isBendahara && row.original.ttd_nominatif_bendahara == null && (
              <DropdownMenuItem
                onClick={() =>
                  row.original.id && onShowVerifikasi(row.original.id)
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Verifikasi
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => row.original.id && onShowList(row.original.id)}
            >
              <List className="h-4 w-4 mr-1" /> List PKS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
