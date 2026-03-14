import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, FileText, MoreHorizontal, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";
import type { ITrxPks } from "@/types/pks";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { BiayaItem } from "../../../components/pks/BiayaItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatRupiah } from "@/utils/stringFormatter";

export const getColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<ITrxPks>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "no_pks",
    header: "No. PKS",
  },
  {
    header: "Tanggal PKS",
    cell: ({ row }) => formatTanggalIndo(row.original.tanggal_pks),
  },
  {
    header: "Total Kontrak",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`pks-${data.no_pks}`} className="border-none">
            <AccordionTrigger className="p-0 hover:no-underline cursor-pointer">
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-sm">
                  {formatRupiah(data.nilai_pks ?? 0)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Lihat rincian biaya
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-3">
              <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
                <BiayaItem label="Biaya Hidup" value={data.biaya_hidup} />
                <BiayaItem
                  label="Biaya Pendidikan"
                  value={data.biaya_pendidikan}
                />
                <BiayaItem label="Biaya Buku" value={data.biaya_buku} />
                <BiayaItem
                  label="Biaya Transportasi"
                  value={data.biaya_transportasi}
                />
                <BiayaItem
                  label="Biaya Sertifikasi"
                  value={data.biaya_sertifikasi_kompetensi}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
  {
    accessorKey: "lembaga_pendidikan",
    header: "Lembaga Pendidikan",
    cell: ({ getValue }) => (
      <div className="whitespace-normal break-words">{getValue<string>()}</div>
    ),
  },
  {
    header: "Jenjang",
    accessorKey: "jenjang",
  },
  {
    header: "Tahun Angkatan",
    accessorKey: "tahun_angkatan",
  },

  {
    header: "File PKS",
    cell: ({ row }) => {
      const file = row.original.file_pks;

      if (!file) return <span className="text-muted-foreground">-</span>;

      return (
        <Button variant="outline" size="sm" asChild>
          <a href={file} target="_blank" rel="noopener noreferrer">
            <FileText className="w-4 h-4 mr-1" />
            Lihat
          </a>
        </Button>
      );
    },
  },

  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const pks = row.original;
      const navigate = useNavigate();
      const canUpdate = useHasAccess("U");
      const canDelete = useHasAccess("D");

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-inter">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>

            {canUpdate && (
              <DropdownMenuItem
                onClick={() => navigate(`/database/keuangan/edit/${pks.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Ubah
              </DropdownMenuItem>
            )}

            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(pks.id)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <Trash className="h-4 w-4 mr-1 text-white" /> Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
