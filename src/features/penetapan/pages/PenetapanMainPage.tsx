/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { penetapanService } from "../../../services/penetapanService";
import { GraduationCap, Eye } from "lucide-react";

const PenetapanMainPage = () => {
  const navigate = useNavigate();
  
  // Tambahkan state untuk kebutuhan DataTable
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const { data: response, isLoading } = useQuery({
    queryKey: ["penetapan-master"],
    queryFn: () => penetapanService.getListMaster(),
  });

  const rawData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const columns = [
    { accessorKey: "no", header: "No" },
    { accessorKey: "nama_penetapan", header: "Nama Penetapan" },
    { accessorKey: "tanggal_penetapan", header: "Tanggal Penetapan" },
    { accessorKey: "instansi", header: "Instansi" },
    { accessorKey: "jumlah_kuota", header: "Jumlah Kuota", cell: ({ row }: any) => <span className="font-bold">{row.original.jumlah_kuota}</span> },
    { 
      accessorKey: "keterangan", 
      header: "Keterangan",
      cell: ({ row }: any) => (
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
          {row.original.keterangan}
        </span>
      )
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }: any) => (
        <Button 
          size="sm" 
          variant="outline" 
          className="border-violet-500 text-violet-600 hover:bg-violet-50"
          onClick={() => navigate(`/penetapan/detail/${row.original.id_ref_beasiswa}`)} 
        >
          <Eye className="w-4 h-4 mr-2" /> Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      <div className="max-w-screen-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Penetapan Akhir" }]} />

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-violet-100/50 rounded-xl">
            <GraduationCap className="h-7 w-7 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Tahap Penetapan Akhir</h2>
            <p className="text-sm text-slate-500 mt-1">Daftar penetapan batch beasiswa yang telah disahkan.</p>
          </div>
        </div>

        <Card className="border-0 shadow-md rounded-2xl bg-white">
          <CardHeader className="bg-slate-50 border-b pb-4 pt-6 px-6">
            <CardTitle className="text-lg text-slate-800">Daftar Penetapan</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Berikan parameter lengkap ke DataTable */}
            <DataTable 
              isLoading={isLoading} 
              columns={columns} 
              data={rawData} 
              pageCount={totalPages}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
              searchValue={search}
              onSearchChange={(val) => {
                setSearch(val);
                setPageIndex(0);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PenetapanMainPage;