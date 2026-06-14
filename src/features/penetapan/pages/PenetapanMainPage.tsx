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
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const PenetapanMainPage = () => {
    useRedirectIfHasNotAccess("R"); 
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const { data: response, isLoading } = useQuery({
    queryKey: ["penetapan-master"],
    queryFn: () => penetapanService.getListMaster(),
  });

  const rawData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const columns = [
    { 
      accessorKey: "no", 
      header: "No",
      cell: ({ row }: any) => <span className="text-slate-500">{row.index + 1}</span> 
    },
    { 
      accessorKey: "nama_penetapan", 
      header: "Nama Penetapan",
      cell: ({ row }: any) => <span className="font-semibold text-slate-900">{row.original.nama_penetapan}</span>
    },
    { 
      accessorKey: "tanggal_penetapan", 
      header: "Tanggal Penetapan",
      cell: ({ row }: any) => <span className="text-slate-600">{row.original.tanggal_penetapan}</span>
    },
    { 
      accessorKey: "jumlah_kuota", 
      header: "Jumlah Kuota", 
      cell: ({ row }: any) => <span className="font-bold text-slate-800">{row.original.jumlah_kuota}</span> 
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }: any) => (
        <Button 
          size="sm" 
          variant="outline" 
          className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl h-9 px-4 font-semibold shadow-none transition-colors"
          onClick={() => navigate(`/penetapan/detail/${row.original.id_ref_beasiswa}`)} 
        >
          <Eye className="w-3.5 h-3.5 mr-2" /> Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Penetapan Akhir" }]} />

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 shrink-0 relative z-10">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tahap Penetapan Akhir</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">Daftar penetapan batch beasiswa yang telah disahkan secara resmi.</p>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
            <CardTitle className="text-xl text-slate-800 font-bold">Daftar Penetapan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 sm:p-8">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PenetapanMainPage;