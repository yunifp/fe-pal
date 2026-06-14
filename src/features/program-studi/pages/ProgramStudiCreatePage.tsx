/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { programStudiService } from "@/services/programStudiService";
import { masterService } from "@/services/masterService";
import { programStudiSchema, type ProgramStudiFormData } from "@/types/programStudi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { GraduationCap, BookOpen } from "lucide-react";

const ProgramStudiCreatePage = () => {
    useRedirectIfHasNotAccess("R"); 

  useRedirectIfHasNotAccess("C");

  const { id_pt } = useParams();
  const isGlobalView = !id_pt;
  const idPt = parseInt(id_pt ?? "0");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: ptResponse } = useQuery({
    queryKey: ["perguruan-tinggi-all"],
    queryFn: masterService.getPerguruanTinggi,
  });
  const listPt = ptResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProgramStudiFormData>({
    resolver: zodResolver(programStudiSchema) as any,
    defaultValues: { 
      kuota: 0,
      id_pt: idPt > 0 ? idPt : undefined
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProgramStudiFormData) => programStudiService.createProgramStudi(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Berhasil menambahkan program studi");
      queryClient.invalidateQueries({ queryKey: ["program-studi"] });
      queryClient.invalidateQueries({ queryKey: ["program-studi-all"] });
      
      if (isGlobalView) navigate("/master/program-studi");
      else navigate(`/master/perguruan-tinggi/${idPt}/program-studi`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Terjadi kesalahan saat menyimpan");
    },
  });

  const onSubmit = (data: ProgramStudiFormData) => mutation.mutate(data);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb
          items={
            isGlobalView
              ? [{ name: "Semua Program Studi", url: "/master/program-studi" }, { name: "Tambah Program Studi" }]
              : [
                  { name: "Perguruan Tinggi", url: "/master/perguruan-tinggi" },
                  { name: "Program Studi", url: `/master/perguruan-tinggi/${idPt}/program-studi` },
                  { name: "Tambah Program Studi" },
                ]
          }
        />
        
        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tambah Program Studi</h1>
            <p className="text-sm text-slate-500 mt-1">Lengkapi form di bawah ini untuk menambahkan program studi baru.</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Card className="w-full shadow-sm rounded-3xl border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-800">Informasi Program Studi</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-bold text-slate-700 ml-1">Perguruan Tinggi</Label>
                      <Controller
                        control={control}
                        name="id_pt"
                        render={({ field }) => (
                          <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : undefined}>
                            <SelectTrigger className={`h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.id_pt ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" : ""}`}>
                              <SelectValue placeholder="Pilih Perguruan Tinggi" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                              {listPt.map((pt: any) => (
                                <SelectItem key={pt.id_pt} value={String(pt.id_pt)} className="font-medium">
                                  {pt.nama_pt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.id_pt && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.id_pt.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 ml-1">Jenjang Pendidikan</Label>
                      <Controller
                        control={control}
                        name="jenjang"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                            <SelectTrigger className={`h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.jenjang ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" : ""}`}>
                              <SelectValue placeholder="Pilih Jenjang" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                              {["D1", "D2", "D3", "D4", "S1"].map((j) => (
                                <SelectItem key={j} value={j} className="font-medium">{j}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.jenjang && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.jenjang.message}</p>}
                    </div>

                    <CustInput label="Nama Program Studi" placeholder="Masukkan nama prodi" {...register("nama_prodi")} error={!!errors.nama_prodi} errorMessage={errors.nama_prodi?.message} />
                    
                    <CustInput label="Kuota Penerimaan" type="number" placeholder="0" {...register("kuota", { valueAsNumber: true })} error={!!errors.kuota} errorMessage={errors.kuota?.message} />

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 ml-1">Persyaratan Buta Warna</Label>
                      <Controller
                        control={control}
                        name="boleh_buta_warna"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                            <SelectTrigger className={`h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.boleh_buta_warna ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" : ""}`}>
                              <SelectValue placeholder="Pilih Ketentuan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                              <SelectItem value="Y" className="font-medium text-emerald-700">Ya (Boleh Buta Warna)</SelectItem>
                              <SelectItem value="N" className="font-medium text-rose-700">Tidak (Tidak Boleh Buta Warna)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.boleh_buta_warna && <p className="text-xs text-rose-500 ml-1 font-medium">{errors.boleh_buta_warna.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                  <Link to={isGlobalView ? "/master/program-studi" : `/master/perguruan-tinggi/${idPt}/program-studi`} className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="w-full rounded-xl h-12 px-8 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all">Batal</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full sm:w-auto rounded-xl h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold text-base transition-all">
                    {isSubmitting || mutation.isPending ? "Menyimpan..." : "Simpan Data"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ProgramStudiCreatePage;