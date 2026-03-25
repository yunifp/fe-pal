/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { beasiswaService } from "@/services/beasiswaService";
import { DataTable } from "@/components/DataTable";
import { getColumnsDetail } from "../components/columns_detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner"; // <- Import toast dari sonner
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
      toast.success(res?.message || `Status kluster berhasil diperbarui menjadi ${kluster}.`); // <- Menggunakan toast.success
      fetchDetail();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal merubah kluster."); // <- Menggunakan toast.error
    }
  };

  const columns = getColumnsDetail(handleUpdateKluster);

  return (
    <div className="p-6 space-y-4">
      <Link to="/verifikasi-nasional-v2">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke List Provinsi
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Detail Pendaftar - {namaProvinsi}</CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Total Pendaftar Diverifikasi: {totalPendaftar}
              </p>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari Nama/NIK/Kode..."
                className="pl-8 pr-4 py-2 border rounded-md w-full text-sm"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-6">Memuat detail pendaftar...</p>
          ) : (
            <DataTable 
              columns={columns} 
              data={data} 
              pageCount={totalPages} 
              pageIndex={page - 1} 
              onPageChange={(newPageIndex) => setPage(newPageIndex + 1)} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailProvinsiPage;