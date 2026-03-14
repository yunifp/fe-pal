import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Award,
  Book,
  BookOpen,
  ChevronDown,
  Coffee,
  Truck,
} from "lucide-react";
import type { ITrxPks } from "@/types/pks";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatRupiah } from "@/utils/stringFormatter";
import { BiayaItem } from "@/components/pks/BiayaItem";

export const getColumns = (): ColumnDef<ITrxPks>[] => [
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
    accessorKey: "jenjang",
    header: "Jenjang",
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const pks = row.original;
      const navigate = useNavigate();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer flex items-center justify-between"
            >
              Ajukan Pembiayaan
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-inter space-y-0.5">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/database/pembiayaan/${pks.id}/biaya-hidup`)
              }
            >
              <Coffee className="h-4 w-4 mr-1" /> Biaya Hidup
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/database/pembiayaan/${pks.id}/biaya-pendidikan`)
              }
            >
              <Book className="h-4 w-4 mr-1" /> Biaya Pendidikan
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/database/pembiayaan/${pks.id}/biaya-transportasi`)
              }
            >
              <Truck className="h-4 w-4 mr-1" /> Biaya Transportasi
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/database/pembiayaan/${pks.id}/biaya-buku`)
              }
            >
              <BookOpen className="h-4 w-4 mr-1" /> Biaya Buku
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/database/pembiayaan/${pks.id}/biaya-sertifikasi`)
              }
            >
              <Award className="h-4 w-4 mr-1" /> Biaya Sertifikasi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
