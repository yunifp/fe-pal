import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import type { IMahasiswaPks } from "@/types/pks";
import { History } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PerubahanRekeningDialog } from "@/components/pks/PerubahanRekeningDialog";

interface Props {
  data?: IMahasiswaPks | null;
}

export const IdentitasDetail = ({ data }: Props) => {
  const [perubahanRekeningOpen, setPerubahanRekeningOpen] = useState(false);

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
                <TableCell className="font-medium bg-muted/50">NIM</TableCell>
                <TableCell>{data?.nim ?? "-"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50">Nama</TableCell>
                <TableCell>{data?.nama ?? "-"}</TableCell>
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
