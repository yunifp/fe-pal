import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  identitasUpdateSchema,
  type IdentitasUpdateFormData,
  type IMahasiswaPks,
} from "@/types/pks";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustInput } from "@/components/CustInput";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pksService } from "@/services/pksService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LoadingDialog from "@/components/LoadingDialog";
import { Input } from "@/components/ui/input";
import { Download, History } from "lucide-react";
import type { CreateLogPerubahanRekening } from "@/types/logPerubahan";
import { logPerubahanService } from "@/services/logPerubahanService";
import { PerubahanRekeningDialog } from "../../../../../components/pks/PerubahanRekeningDialog";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";

interface Props {
  data?: IMahasiswaPks | null;
}

export const IdentitasUpdate = ({ data: dataMahasiswa }: Props) => {
  const queryClient = useQueryClient();

  const [perubahanRekeningOpen, setPerubahanRekeningOpen] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IdentitasUpdateFormData>({
    resolver: zodResolver(identitasUpdateSchema),
    defaultValues: {
      kluster: undefined,
    },
  });

  useEffect(() => {
    if (dataMahasiswa) {
      reset({
        nik: dataMahasiswa.nik ?? "",
        nim: dataMahasiswa.nim ?? "",
        nama: dataMahasiswa.nama ?? "",
        jenis_kelamin: dataMahasiswa.jenis_kelamin ?? "",
        asal_kota:
          (dataMahasiswa.kode_kab ?? "") +
          "#" +
          (dataMahasiswa.asal_kota ?? ""),
        asal_provinsi:
          (dataMahasiswa.kode_pro ?? "") +
          "#" +
          (dataMahasiswa.asal_provinsi ?? ""),
        angkatan: dataMahasiswa.angkatan ?? undefined,
        email: dataMahasiswa.email ?? "",
        hp: dataMahasiswa.hp ?? "",
        bank:
          (dataMahasiswa.kode_bank ?? "") + "#" + (dataMahasiswa.bank ?? ""),
        no_rekening: dataMahasiswa.no_rekening ?? "",
        nama_rekening: dataMahasiswa.nama_rekening ?? "",
        kluster:
          (dataMahasiswa.id_kluster ?? "") +
          "#" +
          (dataMahasiswa.kluster ?? ""),

        scan_buku_tabungan: undefined,
      });
    } else {
      reset({
        kluster: undefined,
        scan_buku_tabungan: undefined,
      });
    }
  }, [dataMahasiswa, reset]);

  const klusterOptions = [
    {
      label: "Reguler",
      value: "1#Reguler",
    },
    {
      label: "Afirmasi",
      value: "2#Afirmasi",
    },
  ];

  const jenisKelaminOptions = [
    {
      label: "Laki-Laki",
      value: "L",
    },
    {
      label: "Perempuan",
      value: "P",
    },
  ];

  const { data: responseProvinsi } = useQuery({
    queryKey: ["opsi-provinsi"],
    queryFn: () => masterService.getProvinsi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const provinsiOptions = useMemo(() => {
    return (
      responseProvinsi?.data?.map((provinsi) => ({
        value: String(provinsi.kode_pro + "#" + provinsi.nama_wilayah),
        label: provinsi.nama_wilayah,
      })) || []
    );
  }, [responseProvinsi]);

  const selectedProvinsi = watch("asal_provinsi");

  const { data: responseKabkot } = useQuery({
    queryKey: ["opsi-kabkot", selectedProvinsi],
    queryFn: () =>
      masterService.getKabkot(selectedProvinsi?.split("#")[0] || ""),
    enabled: !!selectedProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kabkotOptions = useMemo(() => {
    return (
      responseKabkot?.data?.map((kabkot) => ({
        value: String(kabkot.kode_kab + "#" + kabkot.nama_wilayah),
        label: kabkot.nama_wilayah,
      })) || []
    );
  }, [responseKabkot]);

  const { data: responseBank } = useQuery({
    queryKey: ["opsi-bank"],
    queryFn: () => masterService.getBank(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const bankOptions = useMemo(() => {
    return (
      responseBank?.data?.map((bank) => ({
        value: String(bank.kode_bank + "#" + bank.bank),
        label: bank.bank + "-" + bank.kode_bank,
      })) || []
    );
  }, [responseBank]);

  // Mengirim data ke API dan refresh cache
  const mutationIdentitas = useMutation({
    mutationFn: (data: IdentitasUpdateFormData) =>
      pksService.updateMahasiswa(dataMahasiswa?.id!!, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pks", "mahasiswa"],
          exact: false,
        });
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  const rekeningMutation = useMutation({
    mutationFn: (data: CreateLogPerubahanRekening) =>
      logPerubahanService.postPerubahanRekening(data),

    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["pks", "mahasiswa"],
          exact: false,
        });
        toast.success("Perubahan rekening diajukan untuk verifikasi");
      } else {
        toast.error(res.message);
      }
    },
  });

  const onSubmit = (data: IdentitasUpdateFormData) => {
    const {
      bank,
      no_rekening,
      nama_rekening,
      scan_buku_tabungan,
      ...identitas
    } = data;

    mutationIdentitas.mutate(identitas);

    const rekeningBerubah =
      bank !==
        (dataMahasiswa?.kode_bank ?? "") + "#" + (dataMahasiswa?.bank ?? "") ||
      no_rekening !== dataMahasiswa?.no_rekening ||
      nama_rekening !== dataMahasiswa?.nama_rekening ||
      scan_buku_tabungan instanceof File;

    if (rekeningBerubah) {
      rekeningMutation.mutate({
        id_mahasiswa: dataMahasiswa?.id!,
        id_trx_pks: dataMahasiswa?.id_trx_pks!,
        nama_bank: bank,
        nomor_rekening: no_rekening,
        nama_rekening: nama_rekening,
        scan_buku_tabungan,
      });
    }
  };

  return (
    <>
      <TabsContent value="identitas" className="mt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium bg-muted/50 w-1/3">
                    NIK
                  </TableCell>
                  <TableCell>
                    <CustInput
                      error={!!errors.nik}
                      errorMessage={errors.nik?.message}
                      {...register("nik")}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Nomor Registrasi Mahasiswa
                  </TableCell>
                  <TableCell>{dataMahasiswa?.nim}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Nama
                  </TableCell>
                  <TableCell>
                    <CustInput
                      error={!!errors.nama}
                      errorMessage={errors.nama?.message}
                      {...register("nama")}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Jenis Kelamin
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      value={watch("jenis_kelamin") ?? ""}
                      onValueChange={(val) => setValue("jenis_kelamin", val)}
                      className="flex gap-6"
                    >
                      {jenisKelaminOptions.map((opt) => {
                        return (
                          <div
                            key={opt.value}
                            className="flex items-center gap-2"
                          >
                            <RadioGroupItem value={opt.value} id={opt.value} />
                            <Label htmlFor={opt.value}>{opt.label}</Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {errors.kluster && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.kluster.message}
                      </p>
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Asal Provinsi
                  </TableCell>
                  <TableCell>
                    <CustSearchableSelect
                      name="asal_provinsi"
                      control={control}
                      options={provinsiOptions}
                      placeholder="Pilih provinsi"
                      error={errors.asal_provinsi}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Asal Kabupaten/Kota
                  </TableCell>
                  <TableCell>
                    <CustSearchableSelect
                      name="asal_kota"
                      control={control}
                      options={kabkotOptions}
                      placeholder="Pilih kabupaten/kota"
                      error={errors.asal_kota}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Angkatan
                  </TableCell>
                  <TableCell>
                    <CustInput
                      type="number"
                      error={!!errors.angkatan}
                      errorMessage={errors.angkatan?.message}
                      {...register("angkatan", { valueAsNumber: true })}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Email
                  </TableCell>
                  <TableCell>
                    <CustInput
                      error={!!errors.email}
                      errorMessage={errors.email?.message}
                      {...register("email")}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    No. HP
                  </TableCell>
                  <TableCell>
                    <CustInput
                      error={!!errors.hp}
                      errorMessage={errors.hp?.message}
                      {...register("hp")}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span>Bank</span>

                      <Button
                        type="button"
                        variant={"outline"}
                        size={"sm"}
                        onClick={() => {
                          setPerubahanRekeningOpen(true);
                        }}
                      >
                        <History className="h-3 w-3" />
                        Log Perubahan
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustSearchableSelect
                      name="bank"
                      control={control}
                      options={bankOptions}
                      placeholder="Pilih bank"
                      error={errors.bank}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    No. Rekening
                  </TableCell>
                  <TableCell>
                    <CustInput
                      error={!!errors.no_rekening}
                      errorMessage={errors.no_rekening?.message}
                      {...register("no_rekening")}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Nama Rekening
                  </TableCell>
                  <TableCell>
                    <CustInput
                      error={!!errors.nama_rekening}
                      errorMessage={errors.nama_rekening?.message}
                      {...register("nama_rekening")}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    File Scan Buku Tabungan
                  </TableCell>
                  <TableCell>
                    {dataMahasiswa?.file_scan_buku_tabungan && (
                      <a
                        onClick={() =>
                          window.open(
                            dataMahasiswa?.file_scan_buku_tabungan!!,
                            "_blank",
                          )
                        }
                        className="cursor-pointer hover:underline text-sm text-primary flex"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Unduh File
                      </a>
                    )}
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setValue("scan_buku_tabungan", file, {
                            shouldValidate: true,
                          });
                        }
                      }}
                    />

                    <p className="text-xs text-muted-foreground">
                      Format file: JPG, PNG, atau PDF (maks. 2MB)
                    </p>

                    {errors.scan_buku_tabungan && (
                      <p className="text-xs text-destructive">
                        {errors.scan_buku_tabungan.message as string}
                      </p>
                    )}
                  </TableCell>
                </TableRow>

                {/* Kluster */}
                <TableRow>
                  <TableCell className="font-medium bg-muted/50">
                    Kluster
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      value={watch("kluster") ?? ""}
                      onValueChange={(val) => setValue("kluster", val)}
                      className="flex gap-6"
                    >
                      {klusterOptions.map((opt) => {
                        const [, label] = opt.value.split("#");

                        return (
                          <div
                            key={opt.value}
                            className="flex items-center gap-2"
                          >
                            <RadioGroupItem value={opt.value} id={opt.value} />
                            <Label htmlFor={opt.value}>{label}</Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {errors.kluster && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.kluster.message}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 w-full flex justify-end">
            <Button type="submit">Ubah Identitas</Button>
          </div>
        </form>
      </TabsContent>

      <LoadingDialog
        open={mutationIdentitas.isPending}
        title="Merubah data mahasiswa"
      />

      <PerubahanRekeningDialog
        open={perubahanRekeningOpen}
        setOpen={setPerubahanRekeningOpen}
        idMahasiswa={dataMahasiswa?.id!!}
        hasPerubahan={dataMahasiswa?.has_perubahan_rekening === 1}
      />
    </>
  );
};
