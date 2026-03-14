/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { programStudiService } from "@/services/programStudiService";
import { masterService } from "@/services/masterService";
import { programStudiSchema, type ProgramStudiFormData } from "@/types/programStudi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ProgramStudiEditPage = () => {
  useRedirectIfHasNotAccess("U");

  const { id_pt, id_prodi } = useParams();
  const isGlobalView = !id_pt;
  const idPt = parseInt(id_pt ?? "0");
  const idProdi = parseInt(id_prodi ?? "0");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: ptResponse, isLoading: isLoadingPt } = useQuery({
    queryKey: ["perguruan-tinggi-all"],
    queryFn: masterService.getPerguruanTinggi,
    staleTime: STALE_TIME,
  });
  const listPt = ptResponse?.data ?? [];

  const { data: detailResponse, isLoading: isLoadingProdi } = useQuery({
    queryKey: ["program-studi-detail", idProdi],
    queryFn: () => programStudiService.getDetailProgramStudi(idProdi),
    enabled: !!idProdi,
    staleTime: STALE_TIME,
  });

  const prodiData = detailResponse?.data;
  
  const isPageLoading = isLoadingPt || isLoadingProdi;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProgramStudiFormData>({
    resolver: zodResolver(programStudiSchema) as any,
    values: prodiData ? {
      id_pt: Number(prodiData.id_pt),
      jenjang: String(prodiData.jenjang || "").trim().toUpperCase() as any,
      nama_prodi: prodiData.nama_prodi,
      kuota: Number(prodiData.kuota || 0),
      boleh_buta_warna: String(prodiData.boleh_buta_warna || "").trim().toUpperCase() as any,
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (formData: ProgramStudiFormData) => programStudiService.updateProgramStudi(idProdi, formData),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Berhasil memperbarui program studi");
      queryClient.invalidateQueries({ queryKey: ["program-studi"] });
      queryClient.invalidateQueries({ queryKey: ["program-studi-all"] });
      queryClient.invalidateQueries({ queryKey: ["program-studi-detail", idProdi] });
      
      if (isGlobalView) navigate("/master/program-studi");
      else navigate(`/master/perguruan-tinggi/${idPt}/program-studi`);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Gagal menyimpan"),
  });

  const onSubmit = (formData: ProgramStudiFormData) => mutation.mutate(formData);

  return (
    <>
      <CustBreadcrumb
        items={
          isGlobalView
            ? [{ name: "Semua Program Studi", url: "/master/program-studi" }, { name: "Ubah Program Studi" }]
            : [
                { name: "Perguruan Tinggi", url: "/master/perguruan-tinggi" },
                { name: "Program Studi", url: `/master/perguruan-tinggi/${idPt}/program-studi` },
                { name: "Ubah Program Studi" },
              ]
        }
      />
      <p className="text-xl font-semibold mt-4">Ubah Program Studi</p>
      
      <div className="mt-3 flex justify-center">
        <Card className="w-full max-w-xl shadow-none">
          <CardContent className="pt-4">
            {isPageLoading ? (
              <p className="text-center text-gray-500 py-4">Memuat data secara penuh...</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-1">
                  <Label>Perguruan Tinggi</Label>
                  <Controller
                    control={control}
                    name="id_pt"
                    render={({ field }) => (
                      <Select 
                        onValueChange={(val) => field.onChange(Number(val))} 
                        value={field.value ? String(field.value) : undefined}
                      >
                        <SelectTrigger className={errors.id_pt ? "border-red-500" : ""}>
                          <SelectValue placeholder="Pilih Perguruan Tinggi" />
                        </SelectTrigger>
                        <SelectContent>
                          {listPt.map((pt: any) => (
                            <SelectItem key={pt.id_pt} value={String(pt.id_pt)}>
                              {pt.nama_pt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.id_pt && <p className="text-xs text-red-500">{errors.id_pt.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Jenjang</Label>
                  <Controller
                    control={control}
                    name="jenjang"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value ? String(field.value).trim().toUpperCase() : undefined}
                      >
                        <SelectTrigger className={errors.jenjang ? "border-red-500" : ""}>
                          <SelectValue placeholder="Pilih Jenjang" />
                        </SelectTrigger>
                        <SelectContent>
                          {["D1", "D2", "D3", "D4", "S1"].map((j) => (
                            <SelectItem key={j} value={j}>{j}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.jenjang && <p className="text-xs text-red-500">{errors.jenjang.message}</p>}
                </div>

                <CustInput label="Nama Program Studi" placeholder="Masukkan nama prodi" {...register("nama_prodi")} error={!!errors.nama_prodi} errorMessage={errors.nama_prodi?.message} />
                
                <CustInput label="Kuota" type="number" placeholder="0" {...register("kuota")} error={!!errors.kuota} errorMessage={errors.kuota?.message} />

                <div className="space-y-1">
                  <Label>Boleh Buta Warna?</Label>
                  <Controller
                    control={control}
                    name="boleh_buta_warna"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value ? String(field.value).trim().toUpperCase() : undefined}
                      >
                        <SelectTrigger className={errors.boleh_buta_warna ? "border-red-500" : ""}>
                          <SelectValue placeholder="Pilih Ya atau Tidak" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Y">Ya (Boleh Buta Warna)</SelectItem>
                          <SelectItem value="N">Tidak (Tidak Boleh Buta Warna)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.boleh_buta_warna && <p className="text-xs text-red-500">{errors.boleh_buta_warna.message}</p>}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Link to={isGlobalView ? "/master/program-studi" : `/master/perguruan-tinggi/${idPt}/program-studi`}>
                    <Button type="button" variant="secondary">Kembali</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                    {isSubmitting || mutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProgramStudiEditPage;