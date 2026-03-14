import LoadingDialog from "@/components/LoadingDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJumlahSemester } from "@/data/jenjangKuliah";
import { logPerubahanService } from "@/services/logPerubahanService";
import { pksService } from "@/services/pksService";
import type { IMahasiswaPks } from "@/types/pks";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, History } from "lucide-react";
import { useEffect, useMemo, useState, type FC } from "react";
import { toast } from "sonner";
import { PerubahanIpkDialog } from "../../../../../components/pks/PerubahanIpkDialog";

interface Props {
  dataMahasiswa: IMahasiswaPks;
  jenjang: string;
}

export const IpkCreate: FC<Props> = ({ dataMahasiswa, jenjang }) => {
  const [perubahanIpkOpen, setPerubahanIpkOpen] = useState(false);

  const idTrxMahasiswa = dataMahasiswa.id ?? 0;

  const jumlahSemester = getJumlahSemester(jenjang);

  const [ipkPerSemester, setIpkPerSemester] = useState<(number | null)[]>(
    Array(jumlahSemester).fill(null),
  );

  const [isSaving, setIsSaving] = useState(false);

  /* =========================
     PRELOAD DATA IPK
  ========================= */
  const { data: ipkResponse, isLoading: isLoadingIpk } = useQuery({
    queryKey: ["ipk", idTrxMahasiswa],
    queryFn: () => pksService.getIpkByMahasiswa(idTrxMahasiswa),
    enabled: !!idTrxMahasiswa,
  });

  useEffect(() => {
    if (!ipkResponse?.data) return;

    const temp = Array(jumlahSemester).fill(0);

    ipkResponse.data.forEach((item: any) => {
      temp[item.semester - 1] = item.nilai;
    });

    setIpkPerSemester(temp);
  }, [ipkResponse, jumlahSemester]);

  const ipKumulatif = useMemo(() => {
    const validValues = ipkPerSemester
      .filter((ip): ip is number => ip !== null && !isNaN(Number(ip)))
      .map(Number); // pastikan numeric

    if (validValues.length === 0) return null;
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
  }, [ipkPerSemester]);

  /* =========================
     SAVE
  ========================= */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const perubahan = ipkPerSemester
        .map((nilai, index) =>
          nilai !== null
            ? {
                semester: index + 1,
                nilai,
              }
            : null,
        )
        .filter(Boolean);

      if (perubahan.length === 0) {
        toast.error("Tidak ada perubahan IPK");
        return;
      }

      await logPerubahanService.postPerubahanIpkBulk(
        idTrxMahasiswa,
        dataMahasiswa.id_trx_pks!!,
        perubahan as any,
      );

      toast.success("Perubahan IPK berhasil diajukan");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Terjadi kesalahan",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatIp = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

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

      {/* Card IP Kumulatif */}
      <div className="mb-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              IP Kumulatif
            </p>
            <p className="mt-1 text-3xl font-bold text-green-800">
              {isLoadingIpk ? (
                <span className="text-base font-normal text-muted-foreground">
                  Memuat...
                </span>
              ) : ipKumulatif !== null ? (
                formatIp(ipKumulatif)
              ) : (
                <span className="text-base font-normal text-muted-foreground">
                  Belum tersedia
                </span>
              )}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
        {!isLoadingIpk && ipKumulatif !== null && (
          <p className="mt-2 text-xs text-green-600">
            Rata-rata dari {ipkPerSemester.filter((ip) => ip !== null).length}{" "}
            semester
          </p>
        )}
      </div>

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
            {ipkPerSemester.length === 0 ? (
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

                  <TableCell>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={4}
                      value={ipk ?? ""}
                      disabled={isSaving || isLoadingIpk}
                      onChange={(e) => {
                        const value = e.target.value;

                        setIpkPerSemester((prev) =>
                          prev.map((v, i) =>
                            i === index
                              ? value === ""
                                ? null
                                : Number(value)
                              : v,
                          ),
                        );
                      }}
                      className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          Simpan IPK
        </Button>
      </div>

      {/* LOADING DIALOG */}
      <LoadingDialog open={isSaving} title="Menyimpan data IPK" />

      <PerubahanIpkDialog
        open={perubahanIpkOpen}
        setOpen={setPerubahanIpkOpen}
        idMahasiswa={dataMahasiswa?.id!!}
        hasPerubahan={dataMahasiswa?.has_perubahan_ipk === 1}
      />
    </>
  );
};
