/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { beasiswaService } from "@/services/beasiswaService";
import { DataTable } from "@/components/DataTable";
import { getColumnsDetail } from "../components/columns_detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Map } from "lucide-react";
import { toast } from "sonner";
import type { DetailPendaftarRow } from "@/types/beasiswa";

const DetailProvinsiPage: React.FC = () => {
  const { kode_prov } = useParams<{ kode_prov: string }>();
  const [data, setData] = useState<DetailPendaftarRow[]>([]);
  const [namaProvinsi, setNamaProvinsi] = useState<string>("");
  const [totalPendaftar, setTotalPendaftar] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (kode_prov) {
      fetchDetail();
    }
  }, [kode_prov, page, search]);

  const fetchDetail = async () => {
    if (!kode_prov) return;
    setLoading(true);
    try {
      const res = await beasiswaService.getDetailProvinsiV2(kode_prov, {
        page,
        limit,
        search,
      });
      if (res?.data) {
        setData(res.data.result || []);
        setNamaProvinsi(res.data.nama_provinsi || "Provinsi");
        setTotalPendaftar(res.data.total_pendaftar || 0);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKluster = async (idTrxBeasiswa: number, kluster: string) => {
    try {
      const res = await beasiswaService.ubahStatusKlusterV2(idTrxBeasiswa, kluster);
      toast.success(res?.message || `Status kluster berhasil diperbarui menjadi ${kluster}.`);
      fetchDetail();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal merubah kluster.");
    }
  };

  const columns = getColumnsDetail(handleUpdateKluster);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-emerald-50 rounded-2xl hidden sm:block mt-1 border border-emerald-100">
              <Map className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Detail Pendaftar Provinsi
              </h2>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Tinjau detail pendaftar dan lakukan penyesuaian kluster afirmasi atau reguler jika diperlukan.
              </p>
            </div>
          </div>
          
          <Link to="/verifikasi-nasional-v2" className="shrink-0">
            <Button variant="outline" className="flex items-center gap-2 shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl h-11 px-5 transition-all w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 text-slate-400" />
              Kembali ke Rekap
            </Button>
          </Link>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div>
                <CardTitle className="text-xl text-slate-800 font-bold flex flex-wrap items-center gap-2.5">
                  <span className="text-emerald-700">{namaProvinsi}</span>
                </CardTitle>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-sm text-slate-500 font-medium">Total Diverifikasi:</span>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                    {totalPendaftar}
                  </span>
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Nama / NIK / Kode..."
                  className="pl-10 pr-4 h-11 border border-slate-200 rounded-full w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm bg-white"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium mt-5 animate-pulse">Memuat detail pendaftar...</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <DataTable 
                  columns={columns} 
                  data={data} 
                  pageCount={totalPages} 
                  pageIndex={page - 1} 
                  onPageChange={(newPageIndex) => setPage(newPageIndex + 1)} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailProvinsiPage;