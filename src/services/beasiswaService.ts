/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BEASISWA_SERVICE_BASE_URL,
  MASTER_SERVICE_BASE_URL,
  AUTH_SERVICE_BASE_URL,
} from "@/constants/api";
import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type {
  FullDataBeasiswa,
  IBeasiswa,
  IJalur,
  InitialTransaksiRequest,
  IPersyaratanKhususBeasiswa,
  IPersyaratanUmumBeasiswa,
  ITrxBeasiswa,
  ITrxDokumenKhusus,
  ITrxDokumenUmum,
  ITrxDokumenDinas,
  IProvinsiCount,
  IKabkotaCount,
  PaginatedTrxBeasiswaResponse,
  VerifikasiDinasFormData,
  VerifikasiFormData,
  IFlowBeasiswa,
} from "@/types/beasiswa";
import type { Response } from "@/types/response";

export const beasiswaService = {
  getBeasiswaAktif: async (): Promise<Response<IBeasiswa>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/beasiswa-aktif`,
      {},
    );
    return response.data;
  },
  getPersyaratanUmumAktifBeasiswa: async (): Promise<
    Response<IPersyaratanUmumBeasiswa[]>
  > => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/persyaratan-umum-aktif`,
      {},
    );
    return response.data;
  },
  getJalur: async (): Promise<Response<IJalur[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/jalur`,
      {},
    );
    return response.data;
  },
  getPersyaratanUmumAktifBeasiswaByJalur: async (
    idJalur: string,
  ): Promise<Response<IPersyaratanKhususBeasiswa[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/persyaratan-khusus-aktif/jalur/${idJalur}`,
      {},
    );
    return response.data;
  },
  getTransaksiBeasiswaByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },
  getTransaksiBeasiswaByPaginationSeleksiAdministrasi: async (
    idBeasiswa: number,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/trx-seleksi-administrasi/${idBeasiswa}`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },
  getTransaksiBeasiswaByPaginationSeleksiAdministrasiDaerah: async (
    idBeasiswa: number,
    page: number = 1,
    search: string = "",
    provinsi?: string,
    kabkota?: string,
    dinas?: string,
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/trx-seleksi-administrasi-daerah/${idBeasiswa}`,
      {
        params: {
          page,
          ...(search && { search }),
          ...(provinsi && { kodeProvinsi: provinsi }),
          ...(kabkota && { kodeKabkota: kabkota }),
          ...(dinas && { Dinas: dinas }),
        },
      },
    );
    return response.data;
  },
  getTransaksiBeasiswaByPaginationVerifikasiDinas: async (
    idBeasiswa: number,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/trx-verifikasi-dinas/${idBeasiswa}`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },
  deleteTransaksiById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${id}`,
    );
    return response.data;
  },
  createInitialTransaksi: async (
    initialTransaksiRequest: InitialTransaksiRequest,
  ): Promise<Response<ITrxBeasiswa>> => {
    const response = await axiosInstanceJson.post(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/initial`,
      initialTransaksiRequest,
    );
    return response.data;
  },
  uploadPersyaratan: async (
    kategori: "umum" | "khusus" | "dinas",
    formData: FormData,
  ): Promise<
    Response<ITrxDokumenUmum | ITrxDokumenKhusus | ITrxDokumenDinas>
  > => {
    const response = await axiosInstanceFormData.post(
      `${BEASISWA_SERVICE_BASE_URL}/persyaratan/upload-persyaratan/${kategori}`,
      formData,
    );
    return response.data;
  },

  uploadPersyaratanDinas: async (
    kategori: "dinas",
    formData: FormData,
  ): Promise<
    Response<ITrxDokumenUmum | ITrxDokumenKhusus | ITrxDokumenDinas>
  > => {
    const response = await axiosInstanceFormData.post(
      `${BEASISWA_SERVICE_BASE_URL}/persyaratan/upload-persyaratan/${kategori}`,
      formData,
    );
    return response.data;
  },

  getUploadedPersyaratan: async (
    kategori: "umum" | "khusus" | "dinas",
    idTrxBeasiswa: number,
  ): Promise<
    Response<ITrxDokumenUmum[] | ITrxDokumenKhusus[] | ITrxDokumenDinas[]>
  > => {
    const response = await axiosInstanceFormData.get(
      `${BEASISWA_SERVICE_BASE_URL}/persyaratan/get-persyaratan/${kategori}/beasiswa/${idTrxBeasiswa}`,
    );
    return response.data;
  },
  submitBeasiswa: async (formData: FormData): Promise<Response<null>> => {
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axiosInstanceFormData.post(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa`,
      formData,
    );

    return response.data;
  },
  getFullDataBeasiswa: async (
    idTrxBeasiswa: number,
  ): Promise<Response<FullDataBeasiswa>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/full/${idTrxBeasiswa}`,
    );
    console.log(response.data);

    return response.data;
  },
  updateCatatanPersyaratan: async (
    idTrxDokumen: number,
    catatan: string,
    kategori: "umum" | "khusus",
    verifikator: "ditjenbun" | "dinas",
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/persyaratan/catatan-persyaratan/${kategori}/${idTrxDokumen}`,
      { verifikator, catatan },
    );
    return response.data;
  },
  updateFlowBeasiswa: async (
    idTrxBeasiswa: number,
    id_flow: number,
    catatan: string | null = null,
    verifikasiData: VerifikasiFormData | VerifikasiDinasFormData | null = null,
    verifikator: "ditjenbun" | "dinas" | null = null,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/flow/${idTrxBeasiswa}`,
      { id_flow, catatan, verifikator, verifikasi_data: verifikasiData },
    );
    return response.data;
  },
  updateTagging: async (
    idTrxBeasiswa: number,
    data: VerifikasiFormData,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/tagging/${idTrxBeasiswa}`,
      data,
    );
    return response.data;
  },
  getCountByProvinsi: async (
    idBeasiswa: number,
  ): Promise<Response<IProvinsiCount[]>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/count-by-provinsi/${idBeasiswa}`,
    );
    return response.data;
  },
  getCountByProvinsiProsesLembagaSeleksi: async (
    idBeasiswa: number,
  ): Promise<Response<IProvinsiCount[]>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/count-by-provinsi-proses-lembaga-seleksi/${idBeasiswa}`,
    );
    return response.data;
  },

  getCountByKabkota: async (
    idBeasiswa: number,
    kodeProvinsi: string,
  ): Promise<Response<IKabkotaCount[]>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/count-by-kabkota/${idBeasiswa}/${kodeProvinsi}`,
    );
    return response.data;
  },

  getCountDataByKabkota: async (
    idBeasiswa: number,
    kodeProvinsi: string,
  ): Promise<Response<IKabkotaCount[]>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/count-data-by-kabkota/${idBeasiswa}/${kodeProvinsi}`,
    );
    return response.data;
  },

  getPendaftarByKabkota: async (
    idBeasiswa: number,
    kodeKabkota: string,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/pendaftar-by-kabkota/${idBeasiswa}`,
      {
        params: {
          kodeKabkota,
          page,
          search,
        },
      },
    );
    return response.data;
  },
  getDetailPendaftar: async (
    idTrxBeasiswa: number,
  ): Promise<Response<ITrxBeasiswa>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/detail-pendaftar/${idTrxBeasiswa}`,
    );
    return response.data;
  },
  getPilihanProgramStudiForForm: async (
    idTrxBeasiswa: number,
  ): Promise<
    Response<
      Array<{
        perguruan_tinggi: string;
        program_studi: string;
      }>
    >
  > => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/pilihan-prodi-form/${idTrxBeasiswa}`,
    );
    return response.data;
  },
  downloadRekapDaerah: async (): Promise<void> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/download-rekap-daerah`,
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "rekap_beasiswa_daerah.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getTotalTrxBeasiswa: async (): Promise<Response<{ total: number }>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/total`,
    );
    return response.data;
  },

  getVerifikatorIds: async (): Promise<Response<number[]>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/users/verifikator-ids`,
    );
    return response.data;
  },

  getFlowBeasiswa: async (): Promise<Response<IFlowBeasiswa[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/flow-beasiswa`,
    );
    return response.data;
  },

  getBebanVerifikator: async (): Promise<
    Response<
      Array<{
        id_verifikator: number;
        total_beban: string;
        nama_lengkap: string;
      }>
    >
  > => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/verifikator/beban`,
    );
    return response.data;
  },

  saveCatatanVerifikasi: async (
    idTrxBeasiswa: number,
    data: {
      verifikator: "ditjenbun" | "dinas_kabkota" | "dinas_provinsi";
      catatan_verifikasi_verifikator?: string;
      catatan_verifikasi_dinas_kabkota?: string;
      catatan_verifikasi_dinas_provinsi?: string;
    },
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idTrxBeasiswa}/catatan-verifikasi`,
      data,
    );
    return response.data;
  },

  getCatatanVerifikasi: async (
    idTrxBeasiswa: number,
  ): Promise<
    Response<{
      id: number;
      id_trx_beasiswa: number;
      data_pribadi_is_valid: string | null;
      catatan_verifikasi_verifikator: string | null;
      catatan_verifikasi_dinas_kabkota: string | null;
      catatan_verifikasi_dinas_provinsi: string | null;
      catatan_by_dinas_provinsi: string | null;
      catatan_by_dinas_kabkota: string | null;
      created_at: string | null;
      created_by: string | null;
    } | null>
  > => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idTrxBeasiswa}/catatan-verifikasi`,
    );
    return response.data;
  },

  updateTagDinasKabkota: async (
    idTrxBeasiswa: number,
    tag: "Y" | "N",
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idTrxBeasiswa}/tag-kabkota`,
      { tag },
    );
    return response.data;
  },

  updateTagDinasProvinsi: async (
    idTrxBeasiswa: number,
    tag: "Y" | "N",
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idTrxBeasiswa}/tag-provinsi`,
      { tag },
    );
    return response.data;
  },

  submitTagDinasKabkotaToProvinsi: async (
    idBeasiswa: number,
    filename: string,
  ): Promise<Response<{ updated: number }>> => {
    const response = await axiosInstanceJson.post(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idBeasiswa}/submit-tag-kabkota`,
      { filename },
    );
    return response.data;
  },

  submitTagDinasProvinsiToDitjenbun: async (
    idBeasiswa: number,
    filename: string,
  ): Promise<Response<{ updated: number }>> => {
    const response = await axiosInstanceJson.post(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idBeasiswa}/submit-tag-provinsi`,
      { filename },
    );
    return response.data;
  },

  getCountTagSiapKirimKabkota: async (
    idBeasiswa: number,
  ): Promise<Response<{ count: number }>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idBeasiswa}/count-tag-kabkota`,
    );
    return response.data;
  },

  getCountTagSiapKirimProvinsi: async (
    idBeasiswa: number,
  ): Promise<Response<{ count: number }>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idBeasiswa}/count-tag-provinsi`,
    );
    return response.data;
  },

  uploadFileSK: async (
    idBeasiswa: number,
    formData: FormData,
  ): Promise<Response<{ filename: string; file: string }>> => {
    const response = await axiosInstanceFormData.post(
      `${BEASISWA_SERVICE_BASE_URL}/persyaratan/upload-file-sk/${idBeasiswa}`,
      formData,
    );
    return response.data;
  },

  uploadFileSKProvinsi: async (
    idBeasiswa: number,
    formData: FormData,
  ): Promise<Response<{ filename: string; file: string }>> => {
    const response = await axiosInstanceFormData.post(
      `${BEASISWA_SERVICE_BASE_URL}/persyaratan/upload-file-sk-provinsi/${idBeasiswa}`,
      formData,
    );
    return response.data;
  },

  getSkKabkotaByProvinsi: async (
    idBeasiswa: number,
  ): Promise<
    Response<
      Array<{
        id: number;
        id_ref_beasiswa: number;
        kode_dinas_kabkota: string;
        nama_dinas_kabkota: string;
        kode_dinas_provinsi: string;
        nama_dinas_provinsi: string;
        filename: string;
        uploaded_by: string;
        created_at: string;
      }>
    >
  > => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idBeasiswa}/sk-kabkota`,
    );
    return response.data;
  },

  getPendaftarByProvinsi: async (
    idBeasiswa: number,
    kodeProvinsi: string,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/pendaftar-by-provinsi/${idBeasiswa}`,
      {
        params: {
          kodeProvinsi,
          page,
          search,
        },
      },
    );
    return response.data;
  },

  getPendaftarByProvinsiLembagaSeleksi: async (
    idBeasiswa: number,
    kodeProvinsi: string,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/pendaftar-by-provinsi-lembaga-seleksi/${idBeasiswa}`,
      {
        params: {
          kodeProvinsi,
          page,
          search,
        },
      },
    );
    return response.data;
  },

  updateDokumenVerifikasiDinas: async (
    idTrxBeasiswa: number,
    data: {
      data_persyaratan_umum: Array<{
        id: number | string;
        kategori: string;
        is_valid: "Y" | "N";
        catatan?: string;
      }>;
    },
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idTrxBeasiswa}/dokumen-verifikasi-dinas`,
      {
        data_persyaratan_umum: data.data_persyaratan_umum.map((item) => ({
          ...item,
          id: Number(item.id),
        })),
      },
    );
    return response.data;
  },

  uploadFileBA: async (
    beasiswaId: number,
    formData: FormData,
  ): Promise<Response<{ filename: string }>> => {
    const response = await axiosInstanceFormData.post(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${beasiswaId}/upload-ba-kabkota`,
      formData,
    );
    return response.data;
  },

  getBaKabkotaByProvinsi: async (
    idBeasiswa: number,
  ): Promise<
    Response<
      Array<{
        id: number;
        id_ref_beasiswa: number;
        kode_dinas_kabkota: string;
        nama_dinas_kabkota: string;
        kode_dinas_provinsi: string;
        nama_dinas_provinsi: string;
        filename: string;
        uploaded_by: string;
        created_at: string;
      }>
    >
  > => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idBeasiswa}/ba-kabkota`,
    );
    return response.data;
  },

  // ── Manajemen Verifikator ──────────────────────────────────────────────────

  /**
   * List pendaftar untuk halaman assignment manual.
   * GET /beasiswa/assignment/pendaftar
   * Kondisi backend: id_ref_beasiswa = 1, id_flow != 1 (exclude draft)
   */
  getPendaftarForAssignment: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    filter?:
      | "all"
      | "assigned"
      | "unassigned"
      | "filter-assigned"
      | "filter-unassigned";
    id_verifikator?: number; // ✅ tambah type ini
  }): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/assignment/pendaftar`,
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search ?? "",
          filter: params.filter ?? "all",
          id_verifikator: params.id_verifikator, // ✅ tambah ini
        },
      },
    );
    return response.data;
  },
  assignVerifikatorByJumlah: async (
    assignments: Array<{
      id_verifikator: number;
      jumlah: number;
      verifikator_nama: string;
    }>,
  ): Promise<
    Response<{
      total_assigned: number;
      verifikator_assigned: number;
      verifikator_nama: string;
    }>
  > => {
    const response = await axiosInstanceJson.post(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/assignment/assign-by-jumlah`,
      { assignments },
    );
    return response.data;
  },
  getUsersByIds: async (
    ids: number[],
  ): Promise<Response<Array<{ id: number; nama_lengkap: string }>>> => {
    const response = await axiosInstanceJson.get(
      `${AUTH_SERVICE_BASE_URL}/users/by-ids`,
      { params: { ids: ids.join(",") } },
    );
    return response.data;
  },
  getRekapLulusAdministrasi: async (
    flag?: string,
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<any> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/rekap-administrasi`,
      { params: { flag, page, limit, search } },
    );
    return response.data;
  },

  getDetailLulusAdministrasi: async (
    tinggalKodeKab: string,
  ): Promise<Response<any[]>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/rekap-administrasi/${tinggalKodeKab}`,
    );
    return response.data;
  },

  updateFlagKewilayahan: async (payload: {
    id_trx_beasiswa?: number | number[];
    flag_kewilayahan: number;
    is_global?: boolean;
  }): Promise<Response<any>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/rekap-administrasi/flag`,
      payload,
    );
    return response.data;
  },

  getLastLogKewilayahan: async (): Promise<Response<any>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/rekap-administrasi/log`,
    );
    return response.data;
  },
  // Ganti dua method di bagian bawah beasiswaService.ts

  updateKluster: async (
    idTrxBeasiswa: number,
    id_kluster: number,
  ): Promise<Response<{ id_kluster: number; nama_kluster: string }>> => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/${idTrxBeasiswa}/kluster`,
      { id_kluster },
    );
    return response.data;
  },

  updateKlusterBulk: async (
    ids: number[],
    id_kluster: number,
  ): Promise<
    Response<{ updated: number; id_kluster: number; nama_kluster: string }>
  > => {
    const response = await axiosInstanceJson.put(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/kluster/bulk`,
      { ids, id_kluster },
    );
    return response.data;
  },
  kirimPembagianWilayah: async (): Promise<any> => {
    const response = await axiosInstanceBeasiswa.put(
      `/verifikasi-nasional-v2/rekap-administrasi/kirim`,
    );
    return response.data;
  },
  getRekapProvinsiV2: async (kode_kabkota?: string): Promise<any> => {
    const params =
      kode_kabkota && kode_kabkota !== "all" ? { kode_kabkota } : {};

    const response = await axiosInstanceBeasiswa.get(
      `/verifikasi-nasional-v2/rekap-provinsi`,
      { params },
    );
    return response.data;
  },
  getDetailProvinsiV2: async (
    kode_prov: string,
    params?: { page?: number; limit?: number; search?: string },
  ): Promise<any> => {
    const response = await axiosInstanceBeasiswa.get(
      `/verifikasi-nasional-v2/detail-provinsi/${kode_prov}`,
      { params },
    );
    return response.data;
  },
  ubahStatusKlusterV2: async (
    idTrxBeasiswa: number,
    nama_kluster: string,
  ): Promise<any> => {
    const response = await axiosInstanceBeasiswa.put(
      `/verifikasi-nasional-v2/ubah-kluster/${idTrxBeasiswa}`,
      { nama_kluster },
    );
    return response.data;
  },
  kirimSeleksiV2: async (): Promise<any> => {
    const response = await axiosInstanceBeasiswa.put(
      `/verifikasi-nasional-v2/kirim-seleksi`,
    );
    return response.data;
  },
  exportDetailV2: async (): Promise<any> => {
    const response = await axiosInstanceBeasiswa.get(
      `/verifikasi-nasional-v2/export-detail`,
    );
    return response.data;
  },
  getPendaftarPenetapanByProvinsi: async (
    idBeasiswa: number,
    kodeProvinsi: string,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/pendaftar-penetapan-by-provinsi/${idBeasiswa}`,
      {
        params: {
          kodeProvinsi,
          page,
          search,
        },
      },
    );
    return response.data;
  },
  getPendaftarPenetapan: async (
    idBeasiswa: number,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedTrxBeasiswaResponse>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/pendaftar-penetapan/${idBeasiswa}`,
      {
        params: { page, search },
      },
    );
    return response.data;
  },
  getDetailPenetapan: async (
    idTrxBeasiswa: number,
  ): Promise<Response<FullDataBeasiswa>> => {
    // FullDataBeasiswa sudah cocok strukturnya
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/detail-penetapan/${idTrxBeasiswa}`,
    );
    return response.data;
  },
  downloadPendaftarAssignment: async (params: {
    filter?: string;
    search?: string;
    id_verifikator?: number;
  }): Promise<void> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/assignment/download`,
      {
        params,
        responseType: "blob",
      },
    );

    const label =
      params.filter === "filter-unassigned"
        ? "belum_assign"
        : params.filter === "filter-assigned"
          ? "sudah_assign"
          : "semua";

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pendaftar_${label}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  // tambah di beasiswaService, setelah downloadPendaftarAssignment

  downloadVerifikasiKabkota: async (params: {
    idBeasiswa: number;
    kodeProvinsi?: string;
    kodeKabkota?: string;
    search?: string;
    idFlow?: number;
    idJalur?: number;
    statusLulus?: "Y" | "N";
  }): Promise<void> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/download-verifikasi-kabkota`,
      {
        params: {
          idBeasiswa: params.idBeasiswa,
          kodeProvinsi: params.kodeProvinsi,
          kodeKabkota: params.kodeKabkota,
          search: params.search ?? "",
          ...(params.idFlow !== undefined && { idFlow: params.idFlow }),
          ...(params.idJalur !== undefined && { idJalur: params.idJalur }),
          ...(params.statusLulus !== undefined && {
            statusLulus: params.statusLulus,
          }),
        },
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `verifikasi-kabkota-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadVerifikasiProvinsi: async (params: {
    idBeasiswa: number;
    kodeProvinsi?: string;
    kodeKabkota?: string;
    search?: string;
    idFlow?: number;
    idJalur?: number;
    statusLulus?: "Y" | "N";
  }): Promise<void> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/download-verifikasi-provinsi`,
      {
        params: {
          idBeasiswa: params.idBeasiswa,
          kodeProvinsi: params.kodeProvinsi,
          kodeKabkota: params.kodeKabkota,
          search: params.search ?? "",
          ...(params.idFlow !== undefined && { idFlow: params.idFlow }),
          ...(params.idJalur !== undefined && { idJalur: params.idJalur }),
          ...(params.statusLulus !== undefined && {
            statusLulus: params.statusLulus,
          }),
        },
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `verifikasi-provinsi-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
