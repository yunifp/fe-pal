import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type {
  BiayaBukuCreateFormData,
  BiayaHidupCreateFormData,
  BiayaPendidikanCreateFormData,
  BiayaSertifikasiCreateFormData,
  BiayaTransportasiCreateFormData,
  GetLockDataRequest,
  IpkCreateFormData,
  ITrxBiayaBuku,
  ITrxBiayaHidup,
  ITrxBiayaPendidikan,
  ITrxBiayaSertifikasi,
  ITrxBiayaTransportasi,
  ITrxIpk,
  ITrxPks,
  ITrxTracerStudi,
  LockDataRequest,
  PaginatedMahasiswaPksResponse,
  PaginatedTrxPksGroupedResponse,
  PaginatedTrxPksResponse,
  PksCreateFormData,
  PksEditFormData,
  IStatistikMahasiswaLanding,
  StatusMahasiswaEditFormData,
  TracerStudiCreateFormData,
  IStatistikMahasiswa,
  IStatistikMahasiswaProvinsiLanding,
  IdentitasUpdateFormData,
  ITrxPksWithMahasiswa,
  ILogPengajuan,
  PaginatedTrxWithJumlahPerubahanPksResponse,
  PaginatedPerubahanDataMahasiswaResponse,
  PksSwakelolaCreateFormData,
  PksSwakelolaEditFormData,
  ITrxPksWithReferensi,
} from "@/types/pks";
import type { Response } from "@/types/response";
import axios from "axios";

export const pksService = {
  getAllPks: async (
    id_lembaga_pendidikan: number | null = null,
    id_jenjang: number | null = null,
    jenis_swakelola: "reguler" | "swakelola" | null = null,
  ): Promise<Response<ITrxPks[]>> => {
    const params: any = {};

    if (id_lembaga_pendidikan !== null)
      params.id_lembaga_pendidikan = id_lembaga_pendidikan;

    if (id_jenjang !== null) params.id_jenjang = id_jenjang;
    if (jenis_swakelola !== null) params.jenis_swakelola = jenis_swakelola;

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/all`,
      { params },
    );

    return response.data;
  },
  getTrxGroupedByPagination: async (
    page: number = 1,
    search: string = "",
    lpId: string | null = null,
    jenjang: string | null = null,
    tahun: string | null = null,
  ): Promise<Response<PaginatedTrxPksGroupedResponse>> => {
    const params: any = {
      page,
      search,
    };

    if (lpId !== null) {
      params.lpId = lpId;
    }

    if (jenjang !== null) {
      params.jenjang = jenjang;
    }

    if (tahun !== null) {
      params.tahun = tahun;
    }

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/grouped`,
      { params },
    );

    return response.data;
  },
  getTrxByPagination: async (
    page: number = 1,
    search: string = "",
    lpId: string | null = null,
    jenjang: string | null = null,
    tahun: string | null = null,
    jenis_swakelola: "reguler" | "swakelola" | null = null,
  ): Promise<Response<PaginatedTrxPksResponse>> => {
    const params: any = {
      page,
      search,
    };

    if (lpId !== null) {
      params.lpId = lpId;
    }

    if (jenjang !== null) {
      params.jenjang = jenjang;
    }

    if (tahun !== null) {
      params.tahun = tahun;
    }

    if (jenis_swakelola !== null) {
      params.jenis_swakelola = jenis_swakelola;
    }

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks`,
      { params },
    );

    return response.data;
  },

  getTrxWithJumlahPerubahanByPagination: async (
    page: number = 1,
    search: string = "",
    lpId: string | null = null,
    jenjang: string | null = null,
    tahun: string | null = null,
    jenis_perubahan: string | null = null,
  ): Promise<Response<PaginatedTrxWithJumlahPerubahanPksResponse>> => {
    const params: any = {
      page,
      search,
    };

    if (lpId !== null) params.lpId = lpId;
    if (jenjang !== null) params.jenjang = jenjang;
    if (tahun !== null) params.tahun = tahun;
    if (jenis_perubahan !== null) params.jenis_perubahan = jenis_perubahan;

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/jumlah-perubahan`,
      { params },
    );

    return response.data;
  },

  createPks: async (data: PksCreateFormData): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("no_pks", data.no_pks);
    formData.append("id_pks_referensi", data.pks_referensi || "");
    formData.append("tanggal_pks", data.tanggal_pks);
    formData.append("tanggal_awal_pks", data.tanggal_awal_pks);
    formData.append("tanggal_akhir_pks", data.tanggal_akhir_pks);

    formData.append("lembaga_pendidikan", data.lembaga_pendidikan);
    formData.append("jenjang", data.jenjang);
    formData.append("is_swakelola", data.is_swakelola);

    formData.append("jumlah_mahasiswa", String(data.jumlah_mahasiswa));

    // 🔥 stringify array tahun
    formData.append("tahun", data.tahun);

    // semua biaya
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith("biaya_") && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (data.file_pks instanceof File) {
      formData.append("file_pks", data.file_pks);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks`,
      formData,
    );

    return response.data;
  },

  createPksSwakelola: async (
    data: PksSwakelolaCreateFormData,
  ): Promise<Response<null>> => {
    console.log("asss");
    console.log(data.pks_sebelumnya);
    const formData = new FormData();

    formData.append("no_pks", data.no_pks);
    formData.append("id_pks_referensi", data.pks_referensi || "");
    formData.append("tanggal_pks", data.tanggal_pks);
    formData.append("tanggal_awal_pks", data.tanggal_awal_pks);
    formData.append("tanggal_akhir_pks", data.tanggal_akhir_pks);

    formData.append("lembaga_pendidikan", data.lembaga_pendidikan);
    formData.append("jenjang", data.jenjang);
    formData.append("is_swakelola", data.is_swakelola);

    formData.append("jumlah_mahasiswa", String(data.jumlah_mahasiswa));

    // 🔥 stringify array tahun
    formData.append("tahun", data.tahun);

    // semua biaya
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith("biaya_") && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (data.file_pks instanceof File) {
      formData.append("file_pks", data.file_pks);
    }
    if (data.pks_sebelumnya && data.pks_sebelumnya?.length > 0) {
      formData.append("pks_sebelumnya", JSON.stringify(data.pks_sebelumnya));
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/swakelola`,
      formData,
    );

    return response.data;
  },

  editPks: async (
    idTrxPks: string,
    data: PksEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("no_pks", data.no_pks);
    formData.append("id_pks_referensi", data.pks_referensi || "");
    formData.append("tanggal_pks", data.tanggal_pks);
    formData.append("tanggal_awal_pks", data.tanggal_awal_pks);
    formData.append("tanggal_akhir_pks", data.tanggal_akhir_pks);

    formData.append("lembaga_pendidikan", data.lembaga_pendidikan);
    formData.append("jenjang", data.jenjang);
    formData.append("is_swakelola", data.is_swakelola);

    formData.append("jumlah_mahasiswa", String(data.jumlah_mahasiswa));

    // 🔥 stringify array tahun
    formData.append("tahun", data.tahun);

    // semua biaya
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith("biaya_") && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (data.file_pks instanceof File) {
      formData.append("file_pks", data.file_pks);
    }

    const response = await axiosInstanceFormData.put(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/${idTrxPks}`,
      formData,
    );

    return response.data;
  },

  editPksSwakelola: async (
    idTrxPks: string,
    data: PksSwakelolaEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("no_pks", data.no_pks);
    formData.append("id_pks_referensi", data.pks_referensi || "");
    formData.append("tanggal_pks", data.tanggal_pks);
    formData.append("tanggal_awal_pks", data.tanggal_awal_pks);
    formData.append("tanggal_akhir_pks", data.tanggal_akhir_pks);

    formData.append("lembaga_pendidikan", data.lembaga_pendidikan);
    formData.append("jenjang", data.jenjang);
    formData.append("is_swakelola", data.is_swakelola);

    formData.append("jumlah_mahasiswa", String(data.jumlah_mahasiswa));

    // 🔥 stringify array tahun
    formData.append("tahun", data.tahun);

    // semua biaya
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith("biaya_") && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (data.file_pks instanceof File) {
      formData.append("file_pks", data.file_pks);
    }
    if (data.pks_sebelumnya && data.pks_sebelumnya?.length > 0) {
      formData.append("pks_sebelumnya", JSON.stringify(data.pks_sebelumnya));
    }

    const response = await axiosInstanceFormData.put(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/swakelola/${idTrxPks}`,
      formData,
    );

    return response.data;
  },

  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/${id}`,
    );
    return response.data;
  },

  getDetailPksById: async (
    id: number,
  ): Promise<Response<ITrxPksWithMahasiswa>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/${id}`,
    );
    return response.data;
  },

  getDetailPksSwakelolaById: async (
    id: number,
  ): Promise<Response<ITrxPksWithReferensi>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/swakelola/${id}`,
    );
    return response.data;
  },

  getMahasiswaByIdPksAndPagination: async (
    page: number = 1,
    search: string = "",
    idPks: number | null = null,
  ): Promise<Response<PaginatedMahasiswaPksResponse>> => {
    const params: any = {
      page,
      search,
    };

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/mahasiswa/${idPks}`,
      { params },
    );

    return response.data;
  },

  getIpkByMahasiswa: async (
    idTrxMahasiswa: number,
  ): Promise<Response<ITrxIpk[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/ipk/${idTrxMahasiswa}`,
    );
    return response.data;
  },
  createIpk: async (
    idTrxMahasiswa: number,
    data: IpkCreateFormData,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/ipk`,
      {
        id_trx_mahasiswa: idTrxMahasiswa,
        semester: data.semester,
        nilai: data.nilai,
      },
    );

    return response.data;
  },

  getBiayaHidupByMahasiswa: async (
    idTrxMahasiswa: number,
  ): Promise<Response<ITrxBiayaHidup[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-hidup/${idTrxMahasiswa}`,
    );
    return response.data;
  },
  createBiayaHidup: async (
    idTrxMahasiswa: number,
    data: BiayaHidupCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_mahasiswa: idTrxMahasiswa,
      ...data,
    };
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-hidup`,
      insertData,
    );
    return response.data;
  },

  getBiayaPendidikanByMahasiswa: async (
    idTrxMahasiswa: number,
  ): Promise<Response<ITrxBiayaPendidikan[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-pendidikan/${idTrxMahasiswa}`,
    );
    return response.data;
  },
  createBiayaPendidikan: async (
    idTrxMahasiswa: number,
    data: BiayaPendidikanCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_mahasiswa: idTrxMahasiswa,
      ...data,
    };
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-pendidikan`,
      insertData,
    );
    return response.data;
  },

  getBiayaBukuByMahasiswa: async (
    idTrxMahasiswa: number,
  ): Promise<Response<ITrxBiayaBuku[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-buku/${idTrxMahasiswa}`,
    );
    return response.data;
  },
  createBiayaBuku: async (
    idTrxMahasiswa: number,
    data: BiayaBukuCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_mahasiswa: idTrxMahasiswa,
      ...data,
    };
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-buku`,
      insertData,
    );
    return response.data;
  },

  getBiayaTransportasiByMahasiswa: async (
    idTrxMahasiswa: number,
  ): Promise<Response<ITrxBiayaTransportasi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-transportasi/${idTrxMahasiswa}`,
    );
    return response.data;
  },
  createBiayaTransportasi: async (
    idTrxMahasiswa: number,
    data: BiayaTransportasiCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_mahasiswa: idTrxMahasiswa,
      ...data,
    };
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-transportasi`,
      insertData,
    );
    return response.data;
  },

  getBiayaSertifikasiByMahasiswa: async (
    idTrxMahasiswa: number,
  ): Promise<Response<ITrxBiayaSertifikasi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-sertifikasi/${idTrxMahasiswa}`,
    );
    return response.data;
  },
  createBiayaSertifikasi: async (
    idTrxMahasiswa: number,
    data: BiayaSertifikasiCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_mahasiswa: idTrxMahasiswa,
      ...data,
    };
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/biaya-sertifikasi`,
      insertData,
    );
    return response.data;
  },

  getTracerStudiByMahasiswa: async (
    idTrxMahasiswa: number,
  ): Promise<Response<ITrxTracerStudi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/tracer-studi/${idTrxMahasiswa}`,
    );
    return response.data;
  },
  createTracerStudi: async (
    idTrxMahasiswa: number,
    data: TracerStudiCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_mahasiswa: idTrxMahasiswa,
      ...data,
    };
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/data-mahasiswa/tracer-studi`,
      insertData,
    );
    return response.data;
  },

  updateStatusMahasiswa: async (
    idTrxMahasiswa: number,
    data: StatusMahasiswaEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("is_active", data.is_active);
    if (data.alasan_tidak_aktif)
      formData.append("alasan_tidak_aktif", data.alasan_tidak_aktif);

    if (data.keterangan_tidak_aktif)
      formData.append("keterangan_tidak_aktif", data.keterangan_tidak_aktif);

    if (data.file_pendukung instanceof File) {
      formData.append("file_pendukung", data.file_pendukung);
    }

    const response = await axiosInstanceFormData.put(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/status-aktif-mahasiswa/${idTrxMahasiswa}`,
      formData,
    );

    return response.data;
  },

  importExcelMahasiswa: async (idTrxPks: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/import-excel-mahasiswa/${idTrxPks}`,
    );
    return response.data;
  },

  getStatistikMahasiswa: async (
    idTrxPks: number,
  ): Promise<Response<IStatistikMahasiswa>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/statistik-mahasiswa`,
      {
        params: {
          pks: idTrxPks,
        },
      },
    );
    return response.data;
  },

  lockDataPks: async (data: LockDataRequest): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/lock-data`,
      data,
    );

    return response.data;
  },

  getLockedDataPks: async (
    data: GetLockDataRequest,
  ): Promise<Response<"Y" | "N">> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/get-lock-data`,
      data,
    );

    return response.data;
  },

  getJumlahMahsiswaPerLembagaPendidikan: async (
    tahun: string,
  ): Promise<IStatistikMahasiswaLanding[]> => {
    const response = await axios.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/statistik-mahasiswa/jumlah-mahasiswa-lp`,
      {
        params: {
          tahun,
        },
      },
    );

    return response.data.data;
  },
  getJumlahMahsiswaPerProvinsi: async (
    tahun: string,
  ): Promise<IStatistikMahasiswaProvinsiLanding[]> => {
    const response = await axios.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/statistik-mahasiswa/jumlah-mahasiswa-provinsi`,
      {
        params: {
          tahun,
        },
      },
    );

    return response.data.data;
  },

  updateMahasiswa: async (
    idMahasiswa: number,
    data: IdentitasUpdateFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    if (data.nik) formData.append("nik", data.nik);
    if (data.nim) formData.append("nim", data.nim);
    if (data.nama) formData.append("nama", data.nama);
    if (data.jenis_kelamin)
      formData.append("jenis_kelamin", data.jenis_kelamin);
    if (data.asal_kota) formData.append("asal_kota", data.asal_kota);
    if (data.asal_provinsi)
      formData.append("asal_provinsi", data.asal_provinsi);

    if (data.angkatan !== undefined && data.angkatan !== null) {
      formData.append("angkatan", String(data.angkatan));
    }

    if (data.email) formData.append("email", data.email);
    if (data.hp) formData.append("hp", data.hp);
    if (data.kluster) formData.append("kluster", data.kluster);

    const response = await axiosInstanceFormData.put(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/mahasiswa/${idMahasiswa}`,
      formData,
    );

    return response.data;
  },

  updateNimMahasiswa: async (
    idMahasiswa: number,
    nim: string,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/mahasiswa/nim/${idMahasiswa}`,
      { nim },
    );

    return response.data;
  },

  exportMahasiswaByPks: async (idTrxPks: number): Promise<Blob> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/mahasiswa/export-excel`,
      { id_trx_pks: idTrxPks },
      {
        responseType: "blob", // WAJIB
      },
    );

    return response.data;
  },
  getLogPengajuan: async (
    idPengajuan: number,
    section:
      | "biaya-hidup"
      | "biaya-buku"
      | "biaya-pendidikan"
      | "biaya-transportasi"
      | "biaya-sertifikasi",
  ): Promise<Response<ILogPengajuan[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/${section}/log/${idPengajuan}`,
    );

    return response.data;
  },

  pksHasPerubahanDataMahasiswa: async (
    idTrxPks: number,
  ): Promise<Response<"Y" | "N">> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/has-perubahan-data-mahasiswa/${idTrxPks}`,
    );
    return response.data;
  },

  getPerubahanDataMahasiswa: async (
    page: number = 1,
    search: string = "",
    lpId: string | null = null,
    jenjang: string | null = null,
    tahun: string | null = null,
    jenisPerubahan: string | null = null,
  ): Promise<Response<PaginatedPerubahanDataMahasiswaResponse>> => {
    const params: any = {
      page,
      search,
      ...(lpId && { lpId }),
      ...(jenjang && { jenjang }),
      ...(tahun && { tahun }),
      ...(jenisPerubahan && { jenisPerubahan }),
    };
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pks/list-perubahan-data-mahasiswa`,
      { params },
    );
    return response.data;
  },
};
