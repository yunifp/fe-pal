import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthRole } from "@/hooks/useAuthRole";
import type { IBatchBiayaPendidikanPks } from "@/types/biayaPendidikan";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Download, List, MoreHorizontal } from "lucide-react";

interface GetColumnsProps {
  onShowList: (idBatch: number) => void;
  onShowVerifikasi: (idBatch: number) => void;
}

export const getColumns = ({
  onShowList,
  onShowVerifikasi,
}: GetColumnsProps): ColumnDef<IBatchBiayaPendidikanPks>[] => [
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
    id: "semester",
    header: "Semester",
    accessorKey: "semester",
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
    header: "File Daftar Nominatif",
    cell: () => {
      const handleDownload = () => {
        const a = document.createElement("a");
        a.href = "/data/templates/blank.pdf";
        a.download = "blank.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
      return (
        <Button variant={"outline"} size={"sm"} onClick={handleDownload}>
          <Download className="h-4 2-4" />
          Lihat File
        </Button>
      );
    },
  },

  {
    id: "file_rekap",
    header: "File Rekap",
    cell: () => {
      const handleDownload = () => {
        const a = document.createElement("a");
        a.href = "/data/templates/blank.pdf";
        a.download = "blank.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      };

      return (
        <Button variant={"outline"} size={"sm"} onClick={handleDownload}>
          <Download className="h-4 2-4" />
          Lihat File
        </Button>
      );
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
