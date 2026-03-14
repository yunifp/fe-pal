import { BadgeStatusTransfer } from "@/components/pks/BadgeStatusTransfer";
import { Button } from "@/components/ui/button";
import type { ITrxBiayaTransportasiPksWithPks } from "@/types/biayaTransportasi";
import type { ColumnDef } from "@tanstack/react-table";
import { FileSignature, FileText, Receipt, ReceiptText } from "lucide-react";
import { BadgeFlowLembagaPendidikan } from "@/components/pks/BadgeFlowLembagaPendidikan";
import { formatRupiah } from "@/utils/stringFormatter";
import { BadgeSubFlowLembagaPendidikan } from "@/components/pks/BadgeSubFlowLembagaPendidikan";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getColumnsBiayaTransportasi =
  (): ColumnDef<ITrxBiayaTransportasiPksWithPks>[] => [
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

            {/* Salinan Bukti Pengeluaran */}
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
                      href={data.file_salinan_bukti_pengeluaran!!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ReceiptText className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-inter">
                  <p>Salinan Bukti Pengeluaran</p>
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
    {
      header: "Status Transfer",
      cell: ({ row }) => (
        <BadgeStatusTransfer status={row.original.status_transfer} />
      ),
    },
  ];
