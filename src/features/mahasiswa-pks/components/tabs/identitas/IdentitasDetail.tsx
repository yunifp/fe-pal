import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import type { IMahasiswaPks } from "@/types/pks";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { PerubahanRekeningDialog } from "../../../../../components/pks/PerubahanRekeningDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pksService } from "@/services/pksService";
import { toast } from "sonner";

interface Props {
  data?: IMahasiswaPks | null;
}

const validateNim = (nim: string): string | null => {
  if (!nim.trim()) return "NIM wajib diisi";

  if (!/^\d+$/.test(nim)) return "NIM hanya boleh berisi angka";

  if (nim.length < 8 || nim.length > 12) return "NIM harus 8–12 digit";

  return null;
};

export const IdentitasDetail = ({ data }: Props) => {
  const queryClient = useQueryClient();

  const [perubahanRekeningOpen, setPerubahanRekeningOpen] = useState(false);
  const [nim, setNim] = useState("");

  useEffect(() => {
    if (data) {
      setNim(data.nim);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: ({ idMahasiswa, nim }: { idMahasiswa: number; nim: string }) =>
      pksService.updateNimMahasiswa(idMahasiswa, nim),

    onSuccess: () => {
      toast.success("Berhasil menyimpan nomor registrasi");
      queryClient.invalidateQueries({
        queryKey: ["pks", "mahasiswa"],
        exact: false,
      });
    },

    onError: (_: any) => {
      toast.error("Terjadi kesalahan saat menyimpan data");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateNim(nim);
    if (error) {
      toast.error(error);
      return;
    }

    mutation.mutate({
      idMahasiswa: data?.id!,
      nim,
    });
  };

  return (
    <>
      <TabsContent value="identitas" className="mt-0">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableBody>
              {/* Status */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 w-1/3">
                  Status
                </TableCell>
                <TableCell>
                  {data ? (data.status === 1 ? "Aktif" : "Tidak Aktif") : "-"}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">NIK</TableCell>
                <TableCell>{data?.nik ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  Nomor Registrasi Mahasiswa
                </TableCell>

                <TableCell>
                  <form className="flex gap-2" onSubmit={handleSubmit}>
                    <Input
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="Masukkan nomor registrasi"
                    />

                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">Nama</TableCell>
                <TableCell>{data?.nama ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  Jenis Kelamin
                </TableCell>
                <TableCell>{data?.jenis_kelamin ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  Asal Kota
                </TableCell>
                <TableCell>{data?.asal_kota ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  Asal Provinsi
                </TableCell>
                <TableCell>{data?.asal_provinsi ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  Angkatan
                </TableCell>
                <TableCell>{data?.angkatan ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">Email</TableCell>
                <TableCell>{data?.email ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  No. HP
                </TableCell>
                <TableCell>{data?.hp ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span>Bank</span>

                    {data?.has_perubahan_rekening === 1 && (
                      <Button
                        type="button"
                        variant={"outline"}
                        size={"sm"}
                        onClick={() => {
                          setPerubahanRekeningOpen(true);
                        }}
                      >
                        <History className="h-3 w-3" />
                        Lihat Perubahan
                      </Button>
                    )}
                  </div>
                </TableCell>

                <TableCell>{data?.bank ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  No. Rekening
                </TableCell>
                <TableCell>{data?.no_rekening ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  Nama Rekening{" "}
                </TableCell>
                <TableCell>{data?.nama_rekening ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">
                  Kluster
                </TableCell>
                <TableCell>{data?.kluster ?? "-"}</TableCell>
              </TableRow>

              {/* Khusus Tidak Aktif */}
              {data?.status === 0 && (
                <>
                  <TableRow>
                    <TableCell className="font-medium bg-muted/50">
                      Alasan Tidak Aktif
                    </TableCell>
                    <TableCell>{data.alasan_tidak_aktif ?? "-"}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium bg-muted/50">
                      Keterangan Tidak Aktif
                    </TableCell>
                    <TableCell>{data.keterangan_tidak_aktif ?? "-"}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium bg-muted/50">
                      File Pendukung
                    </TableCell>
                    <TableCell>
                      {data.file_pendukung ? (
                        <a
                          href={data.file_pendukung}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Unduh File
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <PerubahanRekeningDialog
        open={perubahanRekeningOpen}
        setOpen={setPerubahanRekeningOpen}
        idMahasiswa={data?.id!!}
        hasPerubahan={data?.has_perubahan_rekening === 1}
      />
    </>
  );
};
