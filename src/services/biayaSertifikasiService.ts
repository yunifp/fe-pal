import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type {
  AjukanKeVerifikatorFormData,
  BiayaSertifikasiPksCreateFormData,
  GetLockDataRequest,
  ITrxBiayaSertifikasiPks,
  ListSertifikasiWithMahasiswa,
  PaginatedBatchBiayaSertifikasiPksResponse,
  PaginatedBiayaSertifikasiPksResponse,
  PpkBendaharaFormData,
  StaffBeasiswaFormData,
  VerifikatorPjkFormData,
} from "@/types/biayaSertifikasi";
import type { Response } from "@/types/response";
import { base64ToFile } from "@/utils/fileFormatter";

export const biayaSertifikasiService = {
  getBiayaSertifikasiByPks: async (
    idTrxPks: number,
  ): Promise<Response<ITrxBiayaSertifikasiPks[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/${idTrxPks}`,
    );
    return response.data;
  },
  createBiayaSertifikasiPks: async (
    idTrxPks: number,
    data: BiayaSertifikasiPksCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_pks: idTrxPks,
      ...data,
    };
    console.log(insertData);
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi`,
      insertData,
    );
    return response.data;
  },
  getBiayaSertifikasiByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBiayaSertifikasiPksResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi`,
      {
        params: {
          page,
          search,
        },
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

    if (data.salinan_bukti_pengeluaran instanceof File) {
      formData.append(
        "salinan_bukti_pengeluaran",
        data.salinan_bukti_pengeluaran,
      );
    }

    if (data.sptjm instanceof File) {
      formData.append("sptjm", data.sptjm);
    }

    if (data.bukti_kwitansi instanceof File) {
      formData.append("bukti_kwitansi", data.bukti_kwitansi);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/ajukan-ke-verifikator`,
      formData,
    );

    return response.data;
  },

  staffBeasiswa: async (
    idBiayaSertifikasi: number,
    data: StaffBeasiswaFormData,
  ): Promise<Response<null>> => {
    // ✅ Convert ke FormData
    const formData = new FormData();

    // Append field biasa
    formData.append("total_pagu", data.total_pagu.toString());
    formData.append(
      "tagihan_tahap_lalu",
      data.tagihan_tahap_lalu?.toString() || "0",
    );
    formData.append(
      "tagihan_tahap_ini",
      data.tagihan_tahap_ini?.toString() || "0",
    );
    formData.append(
      "tagihan_sd_tahap_ini",
      data.tagihan_sd_tahap_ini?.toString() || "0",
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
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/staff-beasiswa/${idBiayaSertifikasi}`,
      formData,
    );

    return response.data;
  },
  verifikatorPjk: async (
    idBiayaSertifikasi: number,
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
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/verifikator-pjk/${idBiayaSertifikasi}`,
      formData,
    );

    return response.data;
  },
  getPaginatedBatchBiayaSertifikasi: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBatchBiayaSertifikasiPksResponse>> => {
    const params: any = {
      page,
      search,
    };

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/batch`,
      { params },
    );
    return response.data;
  },

  getBiayaSertifikasiByBatchAndPagination: async (
    idBatch: number,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBiayaSertifikasiPksResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/batch/${idBatch}`,
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
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/ajukan-ke-bpdp/${payload.idPengajuan}`,
      {
        verifikasi: payload.verifikasi,
        catatan_revisi: payload.catatanRevisi,
      },
    );

    return response.data;
  },

  generateRab(idBiayaSertifikasi: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/generate-rab/${idBiayaSertifikasi}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  getTagihanTahapLalu: async (
    idBiayaSertifikasi: number,
  ): Promise<Response<number>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/tagihan-tahap-lalu/${idBiayaSertifikasi}`,
    );
    return response.data;
  },

  batchBiayaSertifikasi: async (
    kodeBatch: string,
    ids: string,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/batch`,
      {
        kode_batch: kodeBatch,
        ids,
      },
    );
    return response.data;
  },

  generateNominatif(idTrxPks: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/generate-nominatif/${idTrxPks}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generatePernyataanKeaktifanMahasiswa(idTrxPks: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/generate-pernyataan-keaktifan-mahasiswa/${idTrxPks}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generateSuratPenagihan(idTrxPks: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/generate-surat-penagihan/${idTrxPks}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generateNominatifGabungan(idBatch: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/batch/${idBatch}/generate-nominatif`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generateSptjm({
    id_trx_pks,
    nominal,
    total_mahasiswa_aktif,
  }: {
    id_trx_pks: number;
    nominal: number;
    total_mahasiswa_aktif: number;
  }): Promise<Blob> {
    const payload = { id_trx_pks, nominal, total_mahasiswa_aktif };

    return axiosInstanceJson
      .post(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/generate-sptjm`,
        payload, // ✅ ini body
        {
          responseType: "blob", // ✅ ini config
        },
      )
      .then((res) => res.data);
  },

  generateBuktiKwitansi({
    id_trx_pks,
    nominal,
    total_mahasiswa_aktif,
  }: {
    id_trx_pks: number;
    nominal: number;
    total_mahasiswa_aktif: number;
  }): Promise<Blob> {
    const payload = { id_trx_pks, nominal, total_mahasiswa_aktif };

    return axiosInstanceJson
      .post(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/generate-bukti-kwitansi`,
        payload, // ✅ ini body
        {
          responseType: "blob", // ✅ ini config
        },
      )
      .then((res) => res.data);
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
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/batch/${idBatch}/ppk-bendahara`,
      formData,
    );

    return response.data;
  },

  getLockedDataPks: async (
    data: GetLockDataRequest,
  ): Promise<Response<"Y" | "N">> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/get-lock-data`,
      data,
    );

    return response.data;
  },

  getListBuktiPengeluaran: async (
    idTrxPks: string,
  ): Promise<Response<ListSertifikasiWithMahasiswa[]>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-sertifikasi/mahasiswa-list-sertifikasi`,
      {
        id_trx_pks: idTrxPks,
      },
    );

    return response.data;
  },
};
