import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type {
  AjukanKeVerifikatorFormData,
  BiayaHidupPksCreateFormData,
  ITrxBiayaHidupPks,
  PaginatedBatchBiayaHidupPksResponse,
  PaginatedBiayaHidupPksResponse,
  PaginatedMonitoringPengajuanResponse,
  PpkBendaharaFormData,
  StaffBeasiswaFormData,
  VerifikatorPjkFormData,
} from "@/types/biayaHidup";
import type { Response } from "@/types/response";
import { base64ToFile } from "@/utils/fileFormatter";

export const biayaHidupService = {
  getBiayaHidupByPks: async (
    idTrxPks: number,
  ): Promise<Response<ITrxBiayaHidupPks[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/${idTrxPks}`,
    );
    return response.data;
  },
  createBiayaHidupPks: async (
    idTrxPks: number,
    data: BiayaHidupPksCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_pks: idTrxPks,
      ...data,
    };

    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup`,
      insertData,
    );
    return response.data;
  },
  getBiayaHidupByPagination: async (
    page: number = 1,
    search: string = "",
    lpId: string | null = null,
    jenjang: string | null = null,
    tahun: string | null = null,
  ): Promise<Response<PaginatedBiayaHidupPksResponse>> => {
    const params = {
      page,
      search,
      ...(lpId && { lpId }),
      ...(jenjang && { jenjang }),
      ...(tahun && { tahun }),
    };

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup`,
      {
        params: params,
      },
    );
    return response.data;
  },
  ajukanKeVerifikator: async (
    data: AjukanKeVerifikatorFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    // ===== non-file (optional & required) =====
    if (data.status_verifikasi)
      formData.append("status_verifikasi", data.status_verifikasi);

    if (data.id_trx_pks !== undefined) {
      formData.append("id_trx_pks", String(data.id_trx_pks));
    }

    if (data.bulan) formData.append("bulan", data.bulan);
    if (data.tahun) formData.append("tahun", data.tahun);

    if (data.total_mahasiswa !== undefined) {
      formData.append("total_mahasiswa", String(data.total_mahasiswa));
    }

    if (data.total_mahasiswa_aktif !== undefined) {
      formData.append(
        "total_mahasiswa_aktif",
        String(data.total_mahasiswa_aktif),
      );
    }

    if (data.total_mahasiswa_tidak_aktif !== undefined) {
      formData.append(
        "total_mahasiswa_tidak_aktif",
        String(data.total_mahasiswa_tidak_aktif),
      );
    }

    if (data.jumlah_nominal !== undefined) {
      formData.append("jumlah_nominal", String(data.jumlah_nominal));
    }

    // ===== files (optional) =====
    if (data.daftar_nominatif instanceof File) {
      formData.append("daftar_nominatif", data.daftar_nominatif);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/ajukan-ke-verifikator`,
      formData,
    );

    return response.data;
  },

  staffBeasiswa: async (
    idBiayaHidup: number,
    data: StaffBeasiswaFormData,
  ): Promise<Response<null>> => {
    // ✅ Convert ke FormData
    const formData = new FormData();

    // Append field biasa
    formData.append(
      "tagihan_bulan_lalu",
      data.tagihan_bulan_lalu?.toString() || "0",
    );
    formData.append(
      "tagihan_bulan_ini",
      data.tagihan_bulan_ini?.toString() || "0",
    );
    formData.append(
      "tagihan_sd_bulan_ini",
      data.tagihan_sd_bulan_ini?.toString() || "0",
    );
    formData.append(
      "tagihan_sisa_dana",
      data.tagihan_sisa_dana?.toString() || "0",
    );
    formData.append("verifikasi", data.verifikasi);

    if (data.catatan_revisi) {
      formData.append("catatan_revisi", data.catatan_revisi);
    }
    if (data.ttd) {
      const ttdFile = base64ToFile(data.ttd, "ttd.png");
      formData.append("ttd", ttdFile);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/staff-beasiswa/${idBiayaHidup}`,
      formData,
    );

    return response.data;
  },
  verifikatorPjk: async (
    idBiayaHidup: number,
    data: VerifikatorPjkFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("verifikasi", data.verifikasi);

    if (data.catatan_revisi) {
      formData.append("catatan_revisi", data.catatan_revisi);
    }

    if (data.ttd) {
      const ttdFile = base64ToFile(data.ttd, "ttd.png");
      formData.append("ttd", ttdFile);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/verifikator-pjk/${idBiayaHidup}`,
      formData,
    );

    return response.data;
  },
  getPaginatedBatchBiayaHidup: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBatchBiayaHidupPksResponse>> => {
    const params: any = {
      page,
      search,
    };

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/batch`,
      { params },
    );
    return response.data;
  },

  getBiayaHidupByBatchAndPagination: async (
    idBatch: number,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBiayaHidupPksResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/batch/${idBatch}`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },

  ajukanKeBpdp: async (payload: {
    idPengajuan: number;
    verifikasi: string;
    catatanRevisi?: string;
  }): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/ajukan-ke-bpdp/${payload.idPengajuan}`,
      {
        verifikasi: payload.verifikasi,
        catatan_revisi: payload.catatanRevisi,
      },
    );

    return response.data;
  },

  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/${id}`,
    );
    return response.data;
  },

  generateRab(idBiayaHidup: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/generate-rab/${idBiayaHidup}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  getTagihanBulanLalu: async (
    idBiayaHidup: number,
  ): Promise<Response<number>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/tagihan-bulan-lalu/${idBiayaHidup}`,
    );
    return response.data;
  },

  batchBiayaHidup: async (
    kodeBatch: string,
    ids: string,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/batch`,
      {
        kode_batch: kodeBatch,
        ids,
      },
    );
    return response.data;
  },

  autoBatchBiayaHidup: async (): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/auto-batch`,
    );
    return response.data;
  },

  generateNominatif(idTrxPks: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/generate-nominatif/${idTrxPks}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generateSuratPenagihan(payload: {
    id_trx_pks: number;
    jumlah_nominal: number;
    total_mahasiswa_aktif: number;
  }): Promise<Blob> {
    return axiosInstanceJson
      .post(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/generate-surat-penagihan`,
        payload,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generatePernyataanKeaktifanMahasiswa(idTrxPks: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/generate-pernyataan-keaktifan-mahasiswa/${idTrxPks}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generateNominatifGabungan(idBatch: number) {
    return axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/batch/${idBatch}/generate-nominatif-gabungan`,
      {
        responseType: "blob",
      },
    );
  },

  generateRekap(idBatch: number) {
    return axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/batch/${idBatch}/generate-rekap`,
      {
        responseType: "blob",
      },
    );
  },

  ppkBendahara: async (
    idBatch: number,
    data: PpkBendaharaFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    if (data.ttd_ppk) {
      const ttdFile = base64ToFile(data.ttd_ppk, "ttd.png");
      formData.append("ttd", ttdFile);
      formData.append("actor", "ppk");
    }

    if (data.ttd_bendahara) {
      const ttdFile = base64ToFile(data.ttd_bendahara, "ttd.png");
      formData.append("ttd", ttdFile);
      formData.append("actor", "bendahara");
    }

    const response = await axiosInstanceFormData.put(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/batch/${idBatch}/ppk-bendahara`,
      formData,
    );

    return response.data;
  },
  monitoringPengajuan: async (
    page: number = 1,
    search: string = "",
    bulan: string = "",
    tahun: string = "",
  ): Promise<Response<PaginatedMonitoringPengajuanResponse>> => {
    const params = {
      page,
      search,
      bulan,
      tahun,
    };

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-hidup/monitoring-pengajuan`,
      {
        params: params,
      },
    );
    return response.data;
  },
};
