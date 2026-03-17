import { useEffect, useMemo, useState, type FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  UserCheck,
  FileText,
  MapPin,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Users,
} from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { CustSelect } from "@/components/ui/CustSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createBeasiswaDraftSchema,
  createBeasiswaSchema,
  editBeasiswaSchema,
  // type ITrxDokumenUmum,
  // type ITrxDokumenKhusus,
  type BeasiswaFormData,
  type ITrxBeasiswa,
} from "@/types/beasiswa";
import { masterService } from "@/services/masterService";
import UploadPersyaratanUmum from "./UploadPersyaratanUmum";
import UploadPersyaratanKhusus from "./UploadPersyaratanKhusus";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IdentitasPribadi from "./stepper/IdentitasPribadi";
import Alamat from "./stepper/Alamat";
import AsalSekolah from "./stepper/AsalSekolah";
import PilihanJurusan from "./stepper/PilihanJurusan";
import VerticalStepper from "./stepper/VerticalStepper";
import DataOrtu from "./stepper/DataOrtu";
import PreviewDataBeasiswa from "./PreviewDataBeasiswa";
import { useAuthStore } from "@/stores/authStore";

interface BeasiswaFormProps {
  existBeasiswa: ITrxBeasiswa;
}

const beasiswaSchema = createBeasiswaSchema();
const beasiswaEditSchema = editBeasiswaSchema();
const beasiswaDraftSchema = createBeasiswaDraftSchema();

const BeasiswaForm: FC<BeasiswaFormProps> = ({ existBeasiswa }) => {
  const user = useAuthStore((state) => state.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [previewData, setPreviewData] = useState<BeasiswaFormData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ✅ PERBAIKAN 1: stepFields lengkap — termasuk semua field wajib per step
  // Step 1 (Alamat) sekarang include kerja_* fields
  // Step 4 (Pilihan Jurusan) validasi dilakukan secara custom agar tidak
  //   terblokir oleh nilai kosong di useFieldArray sebelum data terload
  const stepFields: Record<number, (keyof BeasiswaFormData)[]> = {
    0: [
      "nama_lengkap",
      "nik",
      "nkk",
      "jenis_kelamin",
      "no_hp",
      "email",
      "tanggal_lahir",
      "tempat_lahir",
      "agama",
      "suku",
      "berat_badan",
      "tinggi_badan",
      "foto_depan", // ← tambahkan
      "foto_samping_kiri", // ← tambahkan
      "foto_samping_kanan", // ← tambahkan
      "foto_belakang", // ← tambahkan
    ],
    1: [
      "tinggal_provinsi",
      "tinggal_kabkot",
      "tinggal_kecamatan",
      "tinggal_kelurahan",
      "tinggal_dusun",
      "tinggal_kode_pos",
      "tinggal_rt",
      "tinggal_rw",
      "tinggal_alamat",
      "kerja_provinsi",
      "kerja_kabkot",
      "kerja_kecamatan",
      "kerja_kelurahan",
      "kerja_dusun",
      "kerja_kode_pos",
      "kerja_rt",
      "kerja_rw",
      "kerja_alamat",
    ],
    2: [
      "ayah_nama",
      "ayah_nik",
      "ayah_jenjang_pendidikan",
      "ayah_pekerjaan",
      "ayah_penghasilan",
      "ayah_status_hidup",
      "ayah_tempat_lahir",
      "ayah_tanggal_lahir",
      "ayah_status_kekerabatan",
      "ayah_no_hp",
      "ayah_alamat",
      "ibu_nama",
      "ibu_nik",
      "ibu_jenjang_pendidikan",
      "ibu_pekerjaan",
      "ibu_penghasilan",
      "ibu_status_hidup",
      "ibu_tempat_lahir",
      "ibu_tanggal_lahir",
      "ibu_status_kekerabatan",
      "ibu_no_hp",
      "ibu_alamat",
    ],
    3: [
      "jenjang_sekolah",
      "sekolah",
      "jurusan_sekolah",
      "tahun_lulus",
      "sekolah_provinsi",
      "sekolah_kabkot",
      "nama_jurusan_sekolah",
    ],
    4: ["kondisi_buta_warna"],
    5: [],
    6: ["jalur"],
  };

  const getSchema = () => {
    if (isDraftMode) return beasiswaDraftSchema;
    const isNewData = !existBeasiswa.foto && !existBeasiswa.nama_lengkap;
    if (isNewData) return beasiswaSchema;
    return beasiswaEditSchema;
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BeasiswaFormData>({
    resolver: zodResolver(getSchema() as any),
  });

  const { data: responseAgama } = useQuery({
    queryKey: ["ref-agama"],
    queryFn: () => masterService.getAgama(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const agamaOptions = useMemo(() => {
    return (
      responseAgama?.data?.map((item: { id: number; nama_agama: string }) => ({
        value: String(item.nama_agama),
        label: item.nama_agama,
      })) ?? []
    );
  }, [responseAgama]);

  const { data: responseSuku } = useQuery({
    queryKey: ["ref-suku"],
    queryFn: () => masterService.getSuku(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const sukuOptions = useMemo(() => {
    return (
      responseSuku?.data?.map((item: { id: number; nama_suku: string }) => ({
        value: String(item.nama_suku),
        label: item.nama_suku,
      })) ?? []
    );
  }, [responseSuku]);

  useEffect(() => {
    if (existBeasiswa) {
      reset({
        nama_lengkap: existBeasiswa.nama_lengkap ?? user?.nama ?? "",
        nik: existBeasiswa.nik ?? "",
        nkk: existBeasiswa.nkk ?? "",
        jenis_kelamin: existBeasiswa.jenis_kelamin ?? "",
        no_hp: existBeasiswa.no_hp ?? user?.no_hp ?? "",
        email: existBeasiswa.email ?? user?.email ?? "",
        tanggal_lahir: existBeasiswa.tanggal_lahir ?? "",
        tempat_lahir: existBeasiswa.tempat_lahir ?? "",
        agama:
          agamaOptions.find(
            (opt: { value: string; label: string }) =>
              opt.label === existBeasiswa.agama,
          )?.value ??
          existBeasiswa.agama ??
          "",
        suku:
          sukuOptions.find(
            (opt: { value: string; label: string }) =>
              opt.label === existBeasiswa.suku,
          )?.value ??
          existBeasiswa.suku ??
          "",
        pekerjaan: existBeasiswa.pekerjaan ?? "",
        instansi_pekerjaan: existBeasiswa.instansi_pekerjaan ?? "",
        berat_badan: existBeasiswa.berat_badan?.toString(),
        tinggi_badan: existBeasiswa.tinggi_badan?.toString(),
        alamat_kerja_sama_dengan_tinggal:
          existBeasiswa.alamat_kerja_sama_dengan_tinggal ?? false,

        tinggal_provinsi:
          (existBeasiswa.tinggal_kode_prov ?? "") +
          "#" +
          (existBeasiswa.tinggal_prov ?? ""),
        tinggal_kabkot:
          (existBeasiswa.tinggal_kode_kab ?? "") +
          "#" +
          (existBeasiswa.tinggal_kab_kota ?? ""),
        tinggal_kecamatan:
          (existBeasiswa.tinggal_kode_kec ?? "") +
          "#" +
          (existBeasiswa.tinggal_kec ?? ""),
        tinggal_kelurahan:
          (existBeasiswa.tinggal_kode_kel ?? "") +
          "#" +
          (existBeasiswa.tinggal_kel ?? ""),
        tinggal_dusun: existBeasiswa.tinggal_dusun ?? "",
        tinggal_kode_pos: existBeasiswa.tinggal_kode_pos ?? "",
        tinggal_rt: existBeasiswa.tinggal_rt ?? "",
        tinggal_rw: existBeasiswa.tinggal_rw ?? "",
        tinggal_alamat: existBeasiswa.tinggal_alamat ?? "",
        kerja_provinsi:
          (existBeasiswa.kerja_kode_prov ?? "") +
          "#" +
          (existBeasiswa.kerja_prov ?? ""),
        kerja_kabkot:
          (existBeasiswa.kerja_kode_kab ?? "") +
          "#" +
          (existBeasiswa.kerja_kab_kota ?? ""),
        kerja_kecamatan:
          (existBeasiswa.kerja_kode_kec ?? "") +
          "#" +
          (existBeasiswa.kerja_kec ?? ""),
        kerja_kelurahan:
          (existBeasiswa.kerja_kode_kel ?? "") +
          "#" +
          (existBeasiswa.kerja_kel ?? ""),
        kerja_dusun: existBeasiswa.kerja_dusun ?? "",
        kerja_kode_pos: existBeasiswa.kerja_kode_pos ?? "",
        kerja_rt: existBeasiswa.kerja_rt ?? "",
        kerja_rw: existBeasiswa.kerja_rw ?? "",
        kerja_alamat: existBeasiswa.kerja_alamat ?? "",

        ayah_nama: existBeasiswa.ayah_nama ?? "",
        ayah_nik: existBeasiswa.ayah_nik ?? "",
        ayah_jenjang_pendidikan: existBeasiswa.ayah_jenjang_pendidikan ?? "",
        ayah_pekerjaan: existBeasiswa.ayah_pekerjaan ?? "",
        ayah_penghasilan: existBeasiswa.ayah_penghasilan?.toString(),
        ayah_status_hidup: existBeasiswa.ayah_status_hidup ?? "",
        ayah_status_kekerabatan: existBeasiswa.ayah_status_kekerabatan ?? "",
        ayah_tempat_lahir: existBeasiswa.ayah_tempat_lahir ?? "",
        ayah_tanggal_lahir: existBeasiswa.ayah_tanggal_lahir ?? "",
        ayah_no_hp: existBeasiswa.ayah_no_hp ?? "",
        ayah_email: existBeasiswa.ayah_email ?? "",
        ayah_alamat: existBeasiswa.ayah_alamat ?? "",

        ibu_nama: existBeasiswa.ibu_nama ?? "",
        ibu_nik: existBeasiswa.ibu_nik ?? "",
        ibu_jenjang_pendidikan: existBeasiswa.ibu_jenjang_pendidikan ?? "",
        ibu_pekerjaan: existBeasiswa.ibu_pekerjaan ?? "",
        ibu_penghasilan: existBeasiswa.ibu_penghasilan?.toString(),
        ibu_status_hidup: existBeasiswa.ibu_status_hidup ?? "",
        ibu_status_kekerabatan: existBeasiswa.ibu_status_kekerabatan ?? "",
        ibu_tempat_lahir: existBeasiswa.ibu_tempat_lahir ?? "",
        ibu_tanggal_lahir: existBeasiswa.ibu_tanggal_lahir ?? "",
        ibu_no_hp: existBeasiswa.ibu_no_hp ?? "",
        ibu_email: existBeasiswa.ibu_email ?? "",
        ibu_alamat: existBeasiswa.ibu_alamat ?? "",

        wali_nama: existBeasiswa.wali_nama ?? "",
        wali_nik: existBeasiswa.wali_nik ?? "",
        wali_jenjang_pendidikan: existBeasiswa.wali_jenjang_pendidikan ?? "",
        wali_pekerjaan: existBeasiswa.wali_pekerjaan ?? "",
        wali_penghasilan: existBeasiswa.wali_penghasilan?.toString(),
        wali_status_hidup: existBeasiswa.wali_status_hidup ?? "",
        wali_status_kekerabatan: existBeasiswa.wali_status_kekerabatan ?? "",
        wali_tempat_lahir: existBeasiswa.wali_tempat_lahir ?? "",
        wali_tanggal_lahir: existBeasiswa.wali_tanggal_lahir ?? "",
        wali_no_hp: existBeasiswa.wali_no_hp ?? "",
        wali_email: existBeasiswa.wali_email ?? "",
        wali_alamat: existBeasiswa.wali_alamat ?? "",

        sekolah_provinsi:
          (existBeasiswa.sekolah_kode_prov ?? "") +
          "#" +
          (existBeasiswa.sekolah_prov ?? ""),
        sekolah_kabkot:
          (existBeasiswa.sekolah_kode_kab ?? "") +
          "#" +
          (existBeasiswa.sekolah_kab_kota ?? ""),
        // jenjang_sekolah:
        //   (existBeasiswa.id_jenjang_sekolah ?? "") +
        //   "#" +
        //   (existBeasiswa.jenjang_sekolah ?? ""),
        jenjang_sekolah:
          existBeasiswa.id_jenjang_sekolah && existBeasiswa.jenjang_sekolah
            ? existBeasiswa.id_jenjang_sekolah +
              "#" +
              existBeasiswa.jenjang_sekolah
            : "",
        sekolah: existBeasiswa.sekolah ?? "",
        jurusan_sekolah: existBeasiswa.jurusan ?? "",
        tahun_lulus: existBeasiswa.tahun_lulus ?? "",
        nama_jurusan_sekolah: existBeasiswa.nama_jurusan_sekolah ?? "",

        kondisi_buta_warna: existBeasiswa.kondisi_buta_warna ?? "",

        foto_depan: undefined,
        foto_samping_kiri: undefined,
        foto_samping_kanan: undefined,
        foto_belakang: undefined,

        pilihan_program_studi: [],

        jalur:
          (existBeasiswa.id_jalur ?? "") + "#" + (existBeasiswa.jalur ?? ""),
      });
    }
  }, [existBeasiswa, agamaOptions, sukuOptions, reset, user]);

  const steps = [
    {
      id: 0,
      title: "Identitas Pribadi",
      description: "Informasi data diri dan kontak",
      icon: UserCheck,
    },
    {
      id: 1,
      title: "Alamat Lengkap",
      description: "Domisili dan lokasi kerja/kebun",
      icon: MapPin,
    },
    {
      id: 2,
      title: "Data Orang Tua",
      description: "Informasi identitas dan pekerjaan orang tua",
      icon: Users,
    },
    {
      id: 3,
      title: "Asal Sekolah",
      description: "Riwayat pendidikan terakhir",
      icon: GraduationCap,
    },
    {
      id: 4,
      title: "Pilihan Jurusan",
      description: "Program studi dan perguruan tinggi",
      icon: BookOpen,
    },
    {
      id: 5,
      title: "Dokumen Umum",
      description: "Berkas persyaratan wajib",
      icon: FileText,
    },
    {
      id: 6,
      title: "Dokumen Khusus",
      description: "Berkas pendukung tambahan",
      icon: FolderOpen,
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

  const { data: responsePersyaratanUmum } = useQuery({
    queryKey: ["persyaratan-umum-aktif-beasiswa"],
    queryFn: () => beasiswaService.getPersyaratanUmumAktifBeasiswa(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const persyaratanUmum = responsePersyaratanUmum?.data ?? [];

  const { data: responseJalur } = useQuery({
    queryKey: ["jalur"],
    queryFn: () => beasiswaService.getJalur(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jalurOptions = useMemo(() => {
    return (
      responseJalur?.data?.map((jalur) => ({
        value: String(jalur.id + "#" + jalur.jalur),
        label: jalur.jalur,
      })) || []
    );
  }, [responseJalur]);

  const selectedJalur = watch("jalur");

  const jalurId = useMemo(() => {
    if (!selectedJalur) return null;
    return selectedJalur.split("#")[0];
  }, [selectedJalur]);

  const { data: responsePersyaratanKhusus } = useQuery({
    queryKey: ["persyaratan-khusus-aktif-beasiswa", jalurId],
    queryFn: () =>
      beasiswaService.getPersyaratanUmumAktifBeasiswaByJalur(jalurId!!),
    enabled: !!jalurId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const persyaratanKhusus = responsePersyaratanKhusus?.data ?? [];

  const saveDraftSilent = async (data: BeasiswaFormData) => {
    try {
      // ─────────────────────────────────────────────────────
      // Tentukan data pilihan yang akan disimpan.
      //
      // ATURAN:
      //   - Jika ada row dengan PT terisi tapi prodi KOSONG
      //     → form state belum lengkap (child masih fetch prodi)
      //     → fallback ke data yang sudah tersimpan di API
      //     → JANGAN overwrite dengan data tidak lengkap
      //
      //   - Jika semua row yang terisi PT juga punya prodi
      //     → aman untuk disimpan langsung dari form state
      //
      //   - Jika tidak ada satupun PT terisi
      //     → fallback ke API juga
      // ─────────────────────────────────────────────────────
      const currentPilihan = data.pilihan_program_studi ?? [];

      const adaYangTidakLengkap = currentPilihan.some(
        (p) => p.perguruan_tinggi !== "" && p.program_studi === "",
      );
      const adaYangLengkap = currentPilihan.some(
        (p) => p.perguruan_tinggi !== "" && p.program_studi !== "",
      );

      let pilihanToSave = currentPilihan;

      if (adaYangTidakLengkap || !adaYangLengkap) {
        // Form state tidak reliable saat ini — pakai data dari API
        try {
          const existing = await beasiswaService.getPilihanProgramStudiForForm(
            existBeasiswa.id_trx_beasiswa,
          );
          pilihanToSave = existing?.data ?? [];
        } catch {
          pilihanToSave = [];
        }
      }

      const formData = new FormData();
      formData.append("is_draft", "true");
      formData.append(
        "id_trx_beasiswa",
        existBeasiswa.id_trx_beasiswa.toString(),
      );

      if (data.foto instanceof File) formData.append("foto", data.foto);
      if (data.foto_depan instanceof File)
        formData.append("foto_depan", data.foto_depan);
      if (data.foto_samping_kiri instanceof File)
        formData.append("foto_samping_kiri", data.foto_samping_kiri);
      if (data.foto_samping_kanan instanceof File)
        formData.append("foto_samping_kanan", data.foto_samping_kanan);
      if (data.foto_belakang instanceof File)
        formData.append("foto_belakang", data.foto_belakang);

      formData.append("nama_lengkap", data.nama_lengkap ?? "");
      formData.append("nik", data.nik ?? "");
      formData.append("nkk", data.nkk ?? "");
      formData.append("jenis_kelamin", data.jenis_kelamin ?? "");
      formData.append("no_hp", data.no_hp ?? "");
      formData.append("email", data.email ?? "");
      formData.append("tanggal_lahir", data.tanggal_lahir ?? "");
      formData.append("tempat_lahir", data.tempat_lahir ?? "");
      formData.append("agama", data.agama ?? "");
      const sukuFinal =
        data.suku_lainnya && data.suku_lainnya.trim() !== ""
          ? data.suku_lainnya
          : data.suku;
      formData.append("suku", sukuFinal ?? "");
      formData.append("pekerjaan", "0#" + (data.pekerjaan ?? ""));
      formData.append(
        "instansi_pekerjaan",
        "0#" + (data.instansi_pekerjaan ?? ""),
      );
      formData.append("berat_badan", data.berat_badan ?? "");
      formData.append("tinggi_badan", data.tinggi_badan ?? "");
      formData.append("tinggal_provinsi", data.tinggal_provinsi ?? "");
      formData.append("tinggal_kabkot", data.tinggal_kabkot ?? "");
      formData.append("tinggal_kecamatan", data.tinggal_kecamatan ?? "");
      formData.append("tinggal_kelurahan", data.tinggal_kelurahan ?? "");
      formData.append("tinggal_dusun", "0#" + (data.tinggal_dusun ?? ""));
      formData.append("tinggal_kode_pos", data.tinggal_kode_pos ?? "");
      formData.append("tinggal_rt", data.tinggal_rt ?? "");
      formData.append("tinggal_rw", data.tinggal_rw ?? "");
      formData.append("tinggal_alamat", data.tinggal_alamat ?? "");
      formData.append("kerja_provinsi", data.kerja_provinsi ?? "");
      formData.append("kerja_kabkot", data.kerja_kabkot ?? "");
      formData.append("kerja_kecamatan", data.kerja_kecamatan ?? "");
      formData.append("kerja_kelurahan", data.kerja_kelurahan ?? "");
      formData.append("kerja_dusun", "0#" + (data.kerja_dusun ?? ""));
      formData.append("kerja_kode_pos", data.kerja_kode_pos ?? "");
      formData.append("kerja_rt", data.kerja_rt ?? "");
      formData.append("kerja_rw", data.kerja_rw ?? "");
      formData.append("kerja_alamat", data.kerja_alamat ?? "");
      formData.append(
        "alamat_kerja_sama_dengan_tinggal",
        data.alamat_kerja_sama_dengan_tinggal ? "1" : "0",
      );
      formData.append("ayah_nama", data.ayah_nama ?? "");
      formData.append("ayah_nik", data.ayah_nik ?? "");
      formData.append(
        "ayah_jenjang_pendidikan",
        data.ayah_jenjang_pendidikan ?? "",
      );
      formData.append("ayah_pekerjaan", data.ayah_pekerjaan ?? "");
      formData.append("ayah_penghasilan", data.ayah_penghasilan ?? "");
      formData.append(
        "ayah_status_hidup",
        "0#" + (data.ayah_status_hidup ?? ""),
      );
      formData.append(
        "ayah_status_kekerabatan",
        "0#" + (data.ayah_status_kekerabatan ?? ""),
      );
      formData.append("ayah_tempat_lahir", data.ayah_tempat_lahir ?? "");
      formData.append("ayah_tanggal_lahir", data.ayah_tanggal_lahir ?? "");
      formData.append("ayah_no_hp", data.ayah_no_hp ?? "");
      formData.append("ayah_email", data.ayah_email ?? "");
      formData.append("ayah_alamat", data.ayah_alamat ?? "");
      formData.append("ibu_nama", data.ibu_nama ?? "");
      formData.append("ibu_nik", data.ibu_nik ?? "");
      formData.append(
        "ibu_jenjang_pendidikan",
        data.ibu_jenjang_pendidikan ?? "",
      );
      formData.append("ibu_pekerjaan", data.ibu_pekerjaan ?? "");
      formData.append("ibu_penghasilan", data.ibu_penghasilan ?? "");
      formData.append("ibu_status_hidup", "0#" + (data.ibu_status_hidup ?? ""));
      formData.append(
        "ibu_status_kekerabatan",
        "0#" + (data.ibu_status_kekerabatan ?? ""),
      );
      formData.append("ibu_tempat_lahir", data.ibu_tempat_lahir ?? "");
      formData.append("ibu_tanggal_lahir", data.ibu_tanggal_lahir ?? "");
      formData.append("ibu_no_hp", data.ibu_no_hp ?? "");
      formData.append("ibu_email", data.ibu_email ?? "");
      formData.append("ibu_alamat", data.ibu_alamat ?? "");
      formData.append("wali_nama", data.wali_nama ?? "");
      formData.append("wali_nik", data.wali_nik ?? "");
      formData.append(
        "wali_jenjang_pendidikan",
        data.wali_jenjang_pendidikan ?? "",
      );
      formData.append("wali_pekerjaan", data.wali_pekerjaan ?? "");
      formData.append("wali_penghasilan", data.wali_penghasilan ?? "");
      formData.append(
        "wali_status_hidup",
        "0#" + (data.wali_status_hidup ?? ""),
      );
      formData.append(
        "wali_status_kekerabatan",
        "0#" + (data.wali_status_kekerabatan ?? ""),
      );
      formData.append("wali_tempat_lahir", data.wali_tempat_lahir ?? "");
      formData.append("wali_tanggal_lahir", data.wali_tanggal_lahir ?? "");
      formData.append("wali_no_hp", data.wali_no_hp ?? "");
      formData.append("wali_email", data.wali_email ?? "");
      formData.append("wali_alamat", data.wali_alamat ?? "");
      formData.append("sekolah_provinsi", data.sekolah_provinsi ?? "");
      formData.append("sekolah_kabkot", data.sekolah_kabkot ?? "");
      formData.append("jenjang_sekolah", data.jenjang_sekolah ?? "");
      formData.append("sekolah", data.sekolah ?? "");
      formData.append("jurusan", data.jurusan_sekolah ?? "");
      formData.append("tahun_lulus", data.tahun_lulus ?? "");
      formData.append("nama_jurusan_sekolah", data.nama_jurusan_sekolah ?? "");
      formData.append("kondisi_buta_warna", data.kondisi_buta_warna ?? "");
      formData.append("pilihan_program_studi", JSON.stringify(pilihanToSave));
      formData.append("jalur", data.jalur ?? "");

      await beasiswaService.submitBeasiswa(formData);
    } catch (error) {
      // silent
    }
  };

  // ✅ PERBAIKAN 3: handleNext dengan custom validation untuk step 4
  const handleNext = async () => {
    if (currentStep >= steps.length - 1) return;

    const fieldsToValidate = stepFields[currentStep] ?? [];

    // Trigger validasi field biasa
    const isValid =
      fieldsToValidate.length > 0
        ? await trigger(fieldsToValidate as any)
        : true;

    if (!isValid) {
      setShowErrorDialog(true);
      return;
    }

    if (currentStep === 5) {
      try {
        const res = await beasiswaService.getUploadedPersyaratan(
          "umum",
          existBeasiswa.id_trx_beasiswa,
        );
        const uploaded = (res.data ?? []) as Array<{
          id_ref_dokumen: number | null;
        }>;
        const uploadedIds = new Set(
          uploaded
            .filter(
              (u): u is { id_ref_dokumen: number } => u.id_ref_dokumen !== null,
            )
            .map((u) => u.id_ref_dokumen),
        );

        // ✅ Hanya filter dokumen yang wajib
        const belumUpload = persyaratanUmum.filter(
          (item) => item.is_required === "Y" && !uploadedIds.has(item.id),
        );

        if (belumUpload.length > 0) {
          belumUpload.forEach((doc) => {
            toast.error(`Dokumen wajib belum diunggah: ${doc.persyaratan}`);
          });
          return;
        }
      } catch {
        toast.error("Gagal memverifikasi dokumen. Coba lagi.");
        return;
      }
    }

    // if (currentStep === 4) {
    //   const currentPilihan = getValues("pilihan_program_studi");

    //   // Ada PT terisi tapi prodi masih kosong → child mungkin belum selesai fetch
    //   const adaYangTidakLengkap = currentPilihan?.some(
    //     (p) => p.perguruan_tinggi !== "" && p.program_studi === "",
    //   );

    //   if (adaYangTidakLengkap) {
    //     toast.error(
    //       "Masih ada program studi yang belum dipilih. Mohon tunggu hingga semua pilihan termuat, lalu lengkapi pilihan Anda.",
    //     );
    //     return;
    //   }

    //   // Minimal 1 pilihan lengkap
    //   const adaYangLengkap = currentPilihan?.some(
    //     (p) => p.perguruan_tinggi !== "" && p.program_studi !== "",
    //   );

    //   if (!adaYangLengkap) {
    //     try {
    //       const existing = await beasiswaService.getPilihanProgramStudiForForm(
    //         existBeasiswa.id_trx_beasiswa,
    //       );
    //       const pilihanDariApi = existing?.data ?? [];

    //       const apiAdaYangTidakLengkap = pilihanDariApi.some(
    //         (p: any) => p.perguruan_tinggi !== "" && p.program_studi === "",
    //       );
    //       const apiAdaYangLengkap = pilihanDariApi.some(
    //         (p: any) => p.perguruan_tinggi !== "" && p.program_studi !== "",
    //       );

    //       if (apiAdaYangTidakLengkap || !apiAdaYangLengkap) {
    //         toast.error(
    //           "Mohon isi minimal satu pilihan perguruan tinggi dan program studi.",
    //         );
    //         return;
    //       }
    //     } catch {
    //       toast.error(
    //         "Mohon isi minimal satu pilihan perguruan tinggi dan program studi.",
    //       );
    //       return;
    //     }
    //   }
    // }

    if (currentStep === 4) {
      const currentPilihan = getValues("pilihan_program_studi") ?? [];

      // Ada PT terisi tapi prodi masih kosong → child mungkin belum selesai fetch
      const adaYangFetchingProdi = currentPilihan.some(
        (p) =>
          (p?.perguruan_tinggi ?? "") !== "" && (p?.program_studi ?? "") === "",
      );

      if (adaYangFetchingProdi) {
        toast.error(
          "Masih ada program studi yang belum dipilih. Mohon tunggu hingga semua pilihan termuat, lalu lengkapi pilihan Anda.",
        );
        return;
      }

      // Semua row wajib diisi lengkap (PT + prodi)
      const adaRowKosong = currentPilihan.some(
        (p) => !p?.perguruan_tinggi || !p?.program_studi,
      );

      if (adaRowKosong) {
        toast.error(
          "Semua pilihan perguruan tinggi dan program studi wajib diisi.",
        );
        return;
      }

      // Fallback ke API jika form state kosong semua (tidak ada PT yang terisi)
      const adaYangLengkap = currentPilihan.some(
        (p) =>
          (p?.perguruan_tinggi ?? "") !== "" && (p?.program_studi ?? "") !== "",
      );

      if (!adaYangLengkap) {
        try {
          const existing = await beasiswaService.getPilihanProgramStudiForForm(
            existBeasiswa.id_trx_beasiswa,
          );
          const pilihanDariApi = existing?.data ?? [];

          const apiAdaRowKosong = pilihanDariApi.some(
            (p: any) => !p.perguruan_tinggi || !p.program_studi,
          );

          if (apiAdaRowKosong || pilihanDariApi.length === 0) {
            toast.error(
              "Semua pilihan perguruan tinggi dan program studi wajib diisi.",
            );
            return;
          }
        } catch {
          toast.error(
            "Mohon isi minimal satu pilihan perguruan tinggi dan program studi.",
          );
          return;
        }
      }
    }

    // ============================================================
    // TIDAK ADA perubahan lain di BeasiswaForm.tsx
    // ============================================================

    const currentData = watch();
    saveDraftSilent(currentData);
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: BeasiswaFormData) => {
    // ✅ Validasi dokumen khusus wajib
    if (persyaratanKhusus.length > 0) {
      try {
        const res = await beasiswaService.getUploadedPersyaratan(
          "khusus",
          existBeasiswa.id_trx_beasiswa,
        );
        const uploaded = (res.data ?? []) as Array<{
          id_ref_dokumen: number | null;
        }>;
        const uploadedIds = new Set(
          uploaded
            .filter(
              (u): u is { id_ref_dokumen: number } => u.id_ref_dokumen !== null,
            )
            .map((u) => u.id_ref_dokumen),
        );

        const belumUpload = persyaratanKhusus.filter(
          (item) => item.is_required === "Y" && !uploadedIds.has(item.id),
        );

        if (belumUpload.length > 0) {
          belumUpload.forEach((doc) => {
            toast.error(`Dokumen wajib belum diunggah: ${doc.persyaratan}`);
          });
          return;
        }
      } catch {
        toast.error("Gagal memverifikasi dokumen khusus. Coba lagi.");
        return;
      }
    }
    const adaPilihanTerisi = data.pilihan_program_studi?.some(
      (p) => p.perguruan_tinggi !== "",
    );

    if (!adaPilihanTerisi) {
      try {
        const existing = await beasiswaService.getPilihanProgramStudiForForm(
          existBeasiswa.id_trx_beasiswa,
        );
        const pilihanFromApi = existing?.data ?? [];

        if (pilihanFromApi.length === 0) {
          toast.error("Pilihan program studi belum diisi.");
          return;
        }

        setValue("pilihan_program_studi", pilihanFromApi);
        data = { ...data, pilihan_program_studi: pilihanFromApi };
      } catch {
        toast.error("Gagal memuat pilihan program studi.");
        return;
      }
    }

    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const onError = (errors: any) => {
    console.log("FORM ERRORS:", errors);
  };

  const submitFinal = async (data: BeasiswaFormData) => {
    try {
      const formData = new FormData();
      formData.append("is_draft", "false");
      formData.append(
        "id_trx_beasiswa",
        existBeasiswa.id_trx_beasiswa.toString(),
      );

      if (data.foto instanceof File) {
        formData.append("foto", data.foto);
      }
      if (data.foto_depan instanceof File)
        formData.append("foto_depan", data.foto_depan);

      if (data.foto_samping_kiri instanceof File)
        formData.append("foto_samping_kiri", data.foto_samping_kiri);

      if (data.foto_samping_kanan instanceof File)
        formData.append("foto_samping_kanan", data.foto_samping_kanan);

      if (data.foto_belakang instanceof File)
        formData.append("foto_belakang", data.foto_belakang);

      // let idVerifikator: number | null = null;

      // if (existBeasiswa.id_verifikator) {
      //   idVerifikator = existBeasiswa.id_verifikator;
      // } else {
      //   try {
      //     const [resVerifikator, resBeban] = await Promise.all([
      //       beasiswaService.getVerifikatorIds(),
      //       beasiswaService.getBebanVerifikator(),
      //     ]);

      //     const verifikatorIds: number[] = resVerifikator?.data ?? [];
      //     const bebanList: { id_verifikator: number; total_beban: string }[] =
      //       resBeban?.data ?? [];

      //     const bebanMap: Record<number, number> = {};
      //     verifikatorIds.forEach((id) => (bebanMap[id] = 0));
      //     bebanList.forEach((item) => {
      //       if (bebanMap[item.id_verifikator] !== undefined) {
      //         bebanMap[item.id_verifikator] = parseInt(item.total_beban);
      //       }
      //     });

      //     idVerifikator = verifikatorIds.reduce((leastId, currentId) =>
      //       bebanMap[currentId] < bebanMap[leastId] ? currentId : leastId,
      //     );
      //   } catch (err) {
      //     console.error("Gagal hitung verifikator:", err);
      //   }
      // }

      // if (idVerifikator !== null) {
      //   formData.append("id_verifikator", idVerifikator.toString());
      // }

      // formData.append("id_verifikator", null);

      formData.append("nama_lengkap", data.nama_lengkap ?? "");
      formData.append("nik", data.nik ?? "");
      formData.append("nkk", data.nkk ?? "");
      formData.append("jenis_kelamin", data.jenis_kelamin ?? "");
      formData.append("no_hp", data.no_hp ?? "");
      formData.append("email", data.email ?? "");
      formData.append("tanggal_lahir", data.tanggal_lahir ?? "");
      formData.append("tempat_lahir", data.tempat_lahir ?? "");
      formData.append("agama", data.agama ?? "");
      formData.append("suku", data.suku ?? "");
      formData.append("pekerjaan", "0#" + (data.pekerjaan ?? ""));
      formData.append(
        "instansi_pekerjaan",
        "0#" + (data.instansi_pekerjaan ?? ""),
      );
      formData.append("berat_badan", data.berat_badan ?? "");
      formData.append("tinggi_badan", data.tinggi_badan ?? "");
      formData.append("tinggal_provinsi", data.tinggal_provinsi ?? "");
      formData.append("tinggal_kabkot", data.tinggal_kabkot ?? "");
      formData.append("tinggal_kecamatan", data.tinggal_kecamatan ?? "");
      formData.append("tinggal_kelurahan", data.tinggal_kelurahan ?? "");
      formData.append("tinggal_dusun", "0#" + (data.tinggal_dusun ?? ""));
      formData.append("tinggal_kode_pos", data.tinggal_kode_pos ?? "");
      formData.append("tinggal_rt", data.tinggal_rt ?? "");
      formData.append("tinggal_rw", data.tinggal_rw ?? "");
      formData.append("tinggal_alamat", data.tinggal_alamat ?? "");
      formData.append("kerja_provinsi", data.kerja_provinsi ?? "");
      formData.append("kerja_kabkot", data.kerja_kabkot ?? "");
      formData.append("kerja_kecamatan", data.kerja_kecamatan ?? "");
      formData.append("kerja_kelurahan", data.kerja_kelurahan ?? "");
      formData.append("kerja_dusun", "0#" + (data.kerja_dusun ?? ""));
      formData.append("kerja_kode_pos", data.kerja_kode_pos ?? "");
      formData.append("kerja_rt", data.kerja_rt ?? "");
      formData.append("kerja_rw", data.kerja_rw ?? "");
      formData.append("kerja_alamat", data.kerja_alamat ?? "");
      formData.append(
        "alamat_kerja_sama_dengan_tinggal",
        data.alamat_kerja_sama_dengan_tinggal ? "1" : "0",
      );
      formData.append("ayah_nama", data.ayah_nama ?? "");
      formData.append("ayah_nik", data.ayah_nik ?? "");
      formData.append(
        "ayah_jenjang_pendidikan",
        data.ayah_jenjang_pendidikan ?? "",
      );
      formData.append("ayah_pekerjaan", data.ayah_pekerjaan ?? "");
      formData.append("ayah_penghasilan", data.ayah_penghasilan ?? "");
      formData.append(
        "ayah_status_hidup",
        "0#" + (data.ayah_status_hidup ?? ""),
      );
      formData.append(
        "ayah_status_kekerabatan",
        "0#" + (data.ayah_status_kekerabatan ?? ""),
      );
      formData.append("ayah_tempat_lahir", data.ayah_tempat_lahir ?? "");
      formData.append("ayah_tanggal_lahir", data.ayah_tanggal_lahir ?? "");
      formData.append("ayah_no_hp", data.ayah_no_hp ?? "");
      formData.append("ayah_email", data.ayah_email ?? "");
      formData.append("ayah_alamat", data.ayah_alamat ?? "");
      formData.append("ibu_nama", data.ibu_nama ?? "");
      formData.append("ibu_nik", data.ibu_nik ?? "");
      formData.append(
        "ibu_jenjang_pendidikan",
        data.ibu_jenjang_pendidikan ?? "",
      );
      formData.append("ibu_pekerjaan", data.ibu_pekerjaan ?? "");
      formData.append("ibu_penghasilan", data.ibu_penghasilan ?? "");
      formData.append("ibu_status_hidup", "0#" + (data.ibu_status_hidup ?? ""));
      formData.append(
        "ibu_status_kekerabatan",
        "0#" + (data.ibu_status_kekerabatan ?? ""),
      );
      formData.append("ibu_tempat_lahir", data.ibu_tempat_lahir ?? "");
      formData.append("ibu_tanggal_lahir", data.ibu_tanggal_lahir ?? "");
      formData.append("ibu_no_hp", data.ibu_no_hp ?? "");
      formData.append("ibu_email", data.ibu_email ?? "");
      formData.append("ibu_alamat", data.ibu_alamat ?? "");
      formData.append("wali_nama", data.wali_nama ?? "");
      formData.append("wali_nik", data.wali_nik ?? "");
      formData.append(
        "wali_jenjang_pendidikan",
        data.wali_jenjang_pendidikan ?? "",
      );
      formData.append("wali_pekerjaan", data.wali_pekerjaan ?? "");
      formData.append("wali_penghasilan", data.wali_penghasilan ?? "");
      formData.append(
        "wali_status_hidup",
        "0#" + (data.wali_status_hidup ?? ""),
      );
      formData.append(
        "wali_status_kekerabatan",
        "0#" + (data.wali_status_kekerabatan ?? ""),
      );
      formData.append("wali_tempat_lahir", data.wali_tempat_lahir ?? "");
      formData.append("wali_tanggal_lahir", data.wali_tanggal_lahir ?? "");
      formData.append("wali_no_hp", data.wali_no_hp ?? "");
      formData.append("wali_email", data.wali_email ?? "");
      formData.append("wali_alamat", data.wali_alamat ?? "");
      formData.append("sekolah_provinsi", data.sekolah_provinsi ?? "");
      formData.append("sekolah_kabkot", data.sekolah_kabkot ?? "");
      formData.append("jenjang_sekolah", data.jenjang_sekolah ?? "");
      formData.append("sekolah", data.sekolah ?? "");
      formData.append("jurusan", data.jurusan_sekolah ?? "");
      formData.append("tahun_lulus", data.tahun_lulus ?? "");
      formData.append("nama_jurusan_sekolah", data.nama_jurusan_sekolah ?? "");
      formData.append("sequence", "");
      formData.append("kode_pendaftaran", "");
      formData.append("kondisi_buta_warna", data.kondisi_buta_warna ?? "");
      formData.append(
        "pilihan_program_studi",
        JSON.stringify(data.pilihan_program_studi),
      );
      formData.append("jalur", data.jalur ?? "");

      const response = await beasiswaService.submitBeasiswa(formData);

      if (response.success) {
        toast.success("Form berhasil dikirim!");
        window.location.reload();
      } else {
        toast.error(response.message || "Gagal menyimpan draft");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const onDraft = async (data: BeasiswaFormData) => {
    try {
      const formData = new FormData();
      formData.append("is_draft", "true");
      formData.append(
        "id_trx_beasiswa",
        existBeasiswa.id_trx_beasiswa.toString(),
      );

      if (data.foto instanceof File) formData.append("foto", data.foto);
      // Setelah: if (data.foto instanceof File) formData.append("foto", data.foto);

      if (data.foto_depan instanceof File)
        formData.append("foto_depan", data.foto_depan);

      if (data.foto_samping_kiri instanceof File)
        formData.append("foto_samping_kiri", data.foto_samping_kiri);

      if (data.foto_samping_kanan instanceof File)
        formData.append("foto_samping_kanan", data.foto_samping_kanan);

      if (data.foto_belakang instanceof File)
        formData.append("foto_belakang", data.foto_belakang);

      formData.append("nama_lengkap", data.nama_lengkap ?? "");
      formData.append("nik", data.nik ?? "");
      formData.append("nkk", data.nkk ?? "");
      formData.append("jenis_kelamin", data.jenis_kelamin ?? "");
      formData.append("no_hp", data.no_hp ?? "");
      formData.append("email", data.email ?? "");
      formData.append("tanggal_lahir", data.tanggal_lahir ?? "");
      formData.append("tempat_lahir", data.tempat_lahir ?? "");
      formData.append("agama", data.agama ?? "");
      formData.append("suku", data.suku ?? "");
      formData.append("pekerjaan", "0#" + (data.pekerjaan ?? ""));
      formData.append(
        "instansi_pekerjaan",
        "0#" + (data.instansi_pekerjaan ?? ""),
      );
      formData.append("berat_badan", data.berat_badan ?? "");
      formData.append("tinggi_badan", data.tinggi_badan ?? "");
      formData.append("tinggal_provinsi", data.tinggal_provinsi ?? "");
      formData.append("tinggal_kabkot", data.tinggal_kabkot ?? "");
      formData.append("tinggal_kecamatan", data.tinggal_kecamatan ?? "");
      formData.append("tinggal_kelurahan", data.tinggal_kelurahan ?? "");
      formData.append("tinggal_dusun", "0#" + (data.tinggal_dusun ?? ""));
      formData.append("tinggal_kode_pos", data.tinggal_kode_pos ?? "");
      formData.append("tinggal_rt", data.tinggal_rt ?? "");
      formData.append("tinggal_rw", data.tinggal_rw ?? "");
      formData.append("tinggal_alamat", data.tinggal_alamat ?? "");
      formData.append("kerja_provinsi", data.kerja_provinsi ?? "");
      formData.append("kerja_kabkot", data.kerja_kabkot ?? "");
      formData.append("kerja_kecamatan", data.kerja_kecamatan ?? "");
      formData.append("kerja_kelurahan", data.kerja_kelurahan ?? "");
      formData.append("kerja_dusun", "0#" + (data.kerja_dusun ?? ""));
      formData.append("kerja_kode_pos", data.kerja_kode_pos ?? "");
      formData.append("kerja_rt", data.kerja_rt ?? "");
      formData.append("kerja_rw", data.kerja_rw ?? "");
      formData.append("kerja_alamat", data.kerja_alamat ?? "");
      formData.append(
        "alamat_kerja_sama_dengan_tinggal",
        data.alamat_kerja_sama_dengan_tinggal ? "1" : "0",
      );
      formData.append("ayah_nama", data.ayah_nama ?? "");
      formData.append("ayah_nik", data.ayah_nik ?? "");
      formData.append(
        "ayah_jenjang_pendidikan",
        data.ayah_jenjang_pendidikan ?? "",
      );
      formData.append("ayah_pekerjaan", data.ayah_pekerjaan ?? "");
      formData.append("ayah_penghasilan", data.ayah_penghasilan ?? "");
      formData.append(
        "ayah_status_hidup",
        "0#" + (data.ayah_status_hidup ?? ""),
      );
      formData.append(
        "ayah_status_kekerabatan",
        "0#" + (data.ayah_status_kekerabatan ?? ""),
      );
      formData.append("ayah_tempat_lahir", data.ayah_tempat_lahir ?? "");
      formData.append("ayah_tanggal_lahir", data.ayah_tanggal_lahir ?? "");
      formData.append("ayah_no_hp", data.ayah_no_hp ?? "");
      formData.append("ayah_email", data.ayah_email ?? "");
      formData.append("ayah_alamat", data.ayah_alamat ?? "");
      formData.append("ibu_nama", data.ibu_nama ?? "");
      formData.append("ibu_nik", data.ibu_nik ?? "");
      formData.append(
        "ibu_jenjang_pendidikan",
        data.ibu_jenjang_pendidikan ?? "",
      );
      formData.append("ibu_pekerjaan", data.ibu_pekerjaan ?? "");
      formData.append("ibu_penghasilan", data.ibu_penghasilan ?? "");
      formData.append("ibu_status_hidup", "0#" + (data.ibu_status_hidup ?? ""));
      formData.append(
        "ibu_status_kekerabatan",
        "0#" + (data.ibu_status_kekerabatan ?? ""),
      );
      formData.append("ibu_tempat_lahir", data.ibu_tempat_lahir ?? "");
      formData.append("ibu_tanggal_lahir", data.ibu_tanggal_lahir ?? "");
      formData.append("ibu_no_hp", data.ibu_no_hp ?? "");
      formData.append("ibu_email", data.ibu_email ?? "");
      formData.append("ibu_alamat", data.ibu_alamat ?? "");
      formData.append("wali_nama", data.wali_nama ?? "");
      formData.append("wali_nik", data.wali_nik ?? "");
      formData.append(
        "wali_jenjang_pendidikan",
        data.wali_jenjang_pendidikan ?? "",
      );
      formData.append("wali_pekerjaan", data.wali_pekerjaan ?? "");
      formData.append("wali_penghasilan", data.wali_penghasilan ?? "");
      formData.append(
        "wali_status_hidup",
        "0#" + (data.wali_status_hidup ?? ""),
      );
      formData.append(
        "wali_status_kekerabatan",
        "0#" + (data.wali_status_kekerabatan ?? ""),
      );
      formData.append("wali_tempat_lahir", data.wali_tempat_lahir ?? "");
      formData.append("wali_tanggal_lahir", data.wali_tanggal_lahir ?? "");
      formData.append("wali_no_hp", data.wali_no_hp ?? "");
      formData.append("wali_email", data.wali_email ?? "");
      formData.append("wali_alamat", data.wali_alamat ?? "");
      formData.append("sekolah_provinsi", data.sekolah_provinsi ?? "");
      formData.append("sekolah_kabkot", data.sekolah_kabkot ?? "");
      formData.append("jenjang_sekolah", data.jenjang_sekolah ?? "");
      formData.append("sekolah", data.sekolah ?? "");
      formData.append("jurusan", data.jurusan_sekolah ?? "");
      formData.append("tahun_lulus", data.tahun_lulus ?? "");
      formData.append("nama_jurusan_sekolah", data.nama_jurusan_sekolah ?? "");
      formData.append("kondisi_buta_warna", data.kondisi_buta_warna ?? "");
      formData.append(
        "pilihan_program_studi",
        JSON.stringify(data.pilihan_program_studi),
      );
      formData.append("jalur", data.jalur ?? "");

      const response = await beasiswaService.submitBeasiswa(formData);

      if (response.success) {
        toast.success("Draft berhasil disimpan!");
        window.location.reload();
      } else {
        toast.error(response.message || "Gagal menyimpan draft");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDraftClick = () => {
    setIsDraftMode(true);
    setTimeout(() => {
      handleSubmit(onDraft)();
      setIsDraftMode(false);
    }, 0);
  };

  useEffect(() => {
    console.log("Full existBeasiswa:", JSON.stringify(existBeasiswa, null, 2));
  }, [existBeasiswa]);
  return (
    <>
      {!isPreviewOpen && (
        <div className="flex flex-col md:flex-row gap-2 items-start">
          <VerticalStepper steps={steps} currentStep={currentStep} />

          <Card className="shadow-none flex-1">
            <CardContent>
              <div>
                {currentStep === 0 && (
                  <IdentitasPribadi
                    sectionCatatan={{
                      isValid:
                        existBeasiswa.catatan_data_section
                          ?.data_pribadi_is_valid,
                      catatan:
                        existBeasiswa.catatan_data_section
                          ?.data_pribadi_catatan,
                    }}
                    existFoto={existBeasiswa.foto}
                    existFotoDepan={existBeasiswa.foto_depan}
                    existFotoSampingKiri={existBeasiswa.foto_samping_kiri}
                    existFotoSampingKanan={existBeasiswa.foto_samping_kanan}
                    existFotoBelakang={existBeasiswa.foto_belakang}
                    setValue={setValue}
                    register={register}
                    control={control}
                    errors={errors}
                    agamaOptions={agamaOptions}
                    sukuOptions={sukuOptions}
                  />
                )}

                {currentStep === 1 && (
                  <Alamat
                    sectionCatatanTempatTinggal={{
                      isValid:
                        existBeasiswa.catatan_data_section
                          ?.data_tempat_tinggal_is_valid,
                      catatan:
                        existBeasiswa.catatan_data_section
                          ?.data_tempat_tinggal_catatan,
                    }}
                    sectionCatatanTempatBekerja={{
                      isValid:
                        existBeasiswa.catatan_data_section
                          ?.data_tempat_bekerja_is_valid,
                      catatan:
                        existBeasiswa.catatan_data_section
                          ?.data_tempat_bekerja_catatan,
                    }}
                    register={register}
                    control={control}
                    errors={errors}
                    provinsiOptions={provinsiOptions}
                    setValue={setValue}
                  />
                )}

                {currentStep === 2 && (
                  <DataOrtu
                    sectionCatatan={{
                      isValid:
                        existBeasiswa.catatan_data_section
                          ?.data_orang_tua_is_valid,
                      catatan:
                        existBeasiswa.catatan_data_section
                          ?.data_orang_tua_catatan,
                    }}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                )}

                {currentStep === 3 && (
                  <AsalSekolah
                    sectionCatatan={{
                      isValid:
                        existBeasiswa.catatan_data_section
                          ?.data_pendidikan_is_valid,
                      catatan:
                        existBeasiswa.catatan_data_section
                          ?.data_pendidikan_catatan,
                    }}
                    register={register}
                    control={control}
                    errors={errors}
                    provinsiOptions={provinsiOptions}
                  />
                )}

                {currentStep === 4 && (
                  <PilihanJurusan
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    idTrxBeasiswa={existBeasiswa?.id_trx_beasiswa}
                  />
                )}

                {currentStep === 5 && (
                  <UploadPersyaratanUmum
                    idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
                    persyaratanUmum={persyaratanUmum}
                  />
                )}

                {currentStep === 6 && (
                  <div className="space-y-6">
                    <CustSelect
                      name="jalur"
                      control={control}
                      label="Jalur Penerima Beasiswa"
                      options={jalurOptions}
                      placeholder="Pilih jalur penerima beasiswa"
                      error={errors.jalur}
                    />
                    <UploadPersyaratanKhusus
                      idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
                      persyaratanKhusus={persyaratanKhusus}
                    />
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}>
                  Sebelumnya
                </Button>

                <div className="flex gap-2">
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleDraftClick}
                        disabled={isSubmitting}>
                        Simpan Draft
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setIsDraftMode(false);
                          handleSubmit(onSubmit, onError)();
                        }}
                        disabled={isSubmitting}>
                        Submit
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={handleNext}>
                      Selanjutnya
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isPreviewOpen && previewData && (
        <PreviewDataBeasiswa
          previewData={previewData}
          idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
          persyaratan_umum={persyaratanUmum}
          persyaratan_khusus={persyaratanKhusus}
          onBack={() => setIsPreviewOpen(false)}
          onSubmit={submitFinal}
          existFoto={existBeasiswa.foto}
          existFotoDepan={existBeasiswa.foto_depan}
          existFotoSampingKiri={existBeasiswa.foto_samping_kiri}
          existFotoSampingKanan={existBeasiswa.foto_samping_kanan}
          existFotoBelakang={existBeasiswa.foto_belakang}
        />
      )}

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Form Belum Sesuai
            </DialogTitle>
            <DialogDescription>
              Mohon sesuaikan field berikut sebelum melanjutkan:
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            <ul className="space-y-2">
              {Object.entries(errors).map(([field, error]) => (
                <li
                  key={field}
                  className="flex items-start gap-2 text-sm border-l-2 border-destructive pl-3 py-1">
                  <span className="text-muted-foreground">
                    {(error as any).message?.toString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BeasiswaForm;
