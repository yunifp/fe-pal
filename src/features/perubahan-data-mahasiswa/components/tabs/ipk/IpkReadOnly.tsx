import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJumlahSemester } from "@/data/jenjangKuliah";
import { pksService } from "@/services/pksService";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FC } from "react";
import type { IMahasiswaPks } from "@/types/pks";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { PerubahanIpkDialog } from "@/components/pks/PerubahanIpkDialog";

interface Props {
  dataMahasiswa: IMahasiswaPks;
  jenjang: string;
}

export const IpkReadOnly: FC<Props> = ({ dataMahasiswa, jenjang }) => {
  const idTrxMahasiswa = dataMahasiswa.id;

  const [perubahanIpkOpen, setPerubahanIpkOpen] = useState(false);

  const jumlahSemester = getJumlahSemester(jenjang);

  const [ipkPerSemester, setIpkPerSemester] = useState<(number | null)[]>(
    Array(jumlahSemester).fill(null),
  );

  /* =========================
     PRELOAD DATA IPK
  ========================= */
  const { data: ipkResponse, isLoading } = useQuery({
    queryKey: ["ipk", idTrxMahasiswa],
    queryFn: () => pksService.getIpkByMahasiswa(idTrxMahasiswa),
    enabled: !!idTrxMahasiswa,
  });

  useEffect(() => {
    if (!ipkResponse?.data) return;

    const temp = Array(jumlahSemester).fill(null);

    ipkResponse.data.forEach((item: any) => {
      temp[item.semester - 1] = item.nilai;
    });

    setIpkPerSemester(temp);
  }, [ipkResponse, jumlahSemester]);

  return (
    <>
      <Button
        type="button"
        variant={"outline"}
        size={"sm"}
        onClick={() => {
          setPerubahanIpkOpen(true);
        }}
        className="mb-4"
      >
        <History className="h-3 w-3" />
        Log Perubahan
      </Button>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50 hover:bg-green-50">
              <TableHead className="text-center font-medium text-black">
                Semester
              </TableHead>
              <TableHead className="font-medium text-black">IPK</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground py-6"
                >
                  Memuat data IPK...
                </TableCell>
              </TableRow>
            ) : ipkPerSemester.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground py-6"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            ) : (
              ipkPerSemester.map((ipk, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="text-center font-medium">
                    {index + 1}
                  </TableCell>

                  <TableCell className="font-medium">
                    {ipk !== null
                      ? new Intl.NumberFormat("id-ID", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(Number(ipk))
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <PerubahanIpkDialog
        open={perubahanIpkOpen}
        setOpen={setPerubahanIpkOpen}
        idMahasiswa={dataMahasiswa?.id!!}
        hasPerubahan={dataMahasiswa?.has_perubahan_ipk === 1}
      />
    </>
  );
};
