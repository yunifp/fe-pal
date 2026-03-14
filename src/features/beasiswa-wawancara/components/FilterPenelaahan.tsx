import { useState } from "react";
import { Search, X, SlidersHorizontal, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterPenelaahan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [provinsiFilter, setProvinsiFilter] = useState("semua");
  const [kabupatenFilter, setKabupatenFilter] = useState("semua");
  const [kecamatanFilter, setKecamatanFilter] = useState("semua");
  const [jalurFilter, setJalurFilter] = useState("semua");
  const [ptFilter, setPtFilter] = useState("semua");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Count active filters
  const activeFiltersCount = [
    statusFilter !== "semua",
    provinsiFilter !== "semua",
    kabupatenFilter !== "semua",
    kecamatanFilter !== "semua",
    jalurFilter !== "semua",
    ptFilter !== "semua",
    searchQuery !== "",
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setStatusFilter("semua");
    setProvinsiFilter("semua");
    setKabupatenFilter("semua");
    setKecamatanFilter("semua");
    setJalurFilter("semua");
    setPtFilter("semua");
    setSearchQuery("");
  };

  const removeFilter = (filterName: string) => {
    switch (filterName) {
      case "status":
        setStatusFilter("semua");
        break;
      case "provinsi":
        setProvinsiFilter("semua");
        break;
      case "kabupaten":
        setKabupatenFilter("semua");
        break;
      case "kecamatan":
        setKecamatanFilter("semua");
        break;
      case "jalur":
        setJalurFilter("semua");
        break;
      case "pt":
        setPtFilter("semua");
        break;
      case "search":
        setSearchQuery("");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Filter & Pencarian Data
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Temukan data peserta dengan mudah menggunakan filter di
                    bawah
                  </p>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  {activeFiltersCount} Filter Aktif
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Cari berdasarkan nama atau NIK..."
                className="pl-12 pr-10 h-12 text-base border-2 focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter Cepat
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {showAdvanced ? "Sembunyikan" : "Tampilkan"} Filter Lanjutan
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Status Verifikasi
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 border-2 hover:border-blue-300 transition-colors">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Status</SelectItem>
                      <SelectItem value="lulus">✓ Lulus</SelectItem>
                      <SelectItem value="tidak_lulus">✗ Tidak Lulus</SelectItem>
                      <SelectItem value="belum">⏳ Belum Diperiksa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Jalur Beasiswa */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Jalur Beasiswa
                  </label>
                  <Select value={jalurFilter} onValueChange={setJalurFilter}>
                    <SelectTrigger className="h-11 border-2 hover:border-blue-300 transition-colors">
                      <SelectValue placeholder="Pilih Jalur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Jalur</SelectItem>
                      <SelectItem value="Prestasi Akademik">
                        🎓 Prestasi Akademik
                      </SelectItem>
                      <SelectItem value="Prestasi Olahraga">
                        ⚽ Prestasi Olahraga
                      </SelectItem>
                      <SelectItem value="KIP Kuliah">💼 KIP Kuliah</SelectItem>
                      <SelectItem value="Prestasi Seni">
                        🎨 Prestasi Seni
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Perguruan Tinggi */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Perguruan Tinggi
                  </label>
                  <Select value={ptFilter} onValueChange={setPtFilter}>
                    <SelectTrigger className="h-11 border-2 hover:border-blue-300 transition-colors">
                      <SelectValue placeholder="Pilih PT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua PT</SelectItem>
                      <SelectItem value="ITB">ITB</SelectItem>
                      <SelectItem value="UI">UI</SelectItem>
                      <SelectItem value="UGM">UGM</SelectItem>
                      <SelectItem value="UNPAD">UNPAD</SelectItem>
                      <SelectItem value="UNDIP">UNDIP</SelectItem>
                      <SelectItem value="UNAIR">UNAIR</SelectItem>
                      <SelectItem value="UNS">UNS</SelectItem>
                      <SelectItem value="ITS">ITS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="space-y-4 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Filter Berdasarkan Wilayah
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Provinsi */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Provinsi
                    </label>
                    <Select
                      value={provinsiFilter}
                      onValueChange={setProvinsiFilter}
                    >
                      <SelectTrigger className="h-11 bg-white border-2 hover:border-blue-300 transition-colors">
                        <SelectValue placeholder="Pilih Provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Provinsi</SelectItem>
                        <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                        <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                        <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                        <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                        <SelectItem value="Banten">Banten</SelectItem>
                        <SelectItem value="DI Yogyakarta">
                          DI Yogyakarta
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kabupaten */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Kabupaten/Kota
                    </label>
                    <Select
                      value={kabupatenFilter}
                      onValueChange={setKabupatenFilter}
                    >
                      <SelectTrigger className="h-11 bg-white border-2 hover:border-blue-300 transition-colors">
                        <SelectValue placeholder="Pilih Kabupaten" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Kabupaten</SelectItem>
                        <SelectItem value="Bandung">Bandung</SelectItem>
                        <SelectItem value="Semarang">Semarang</SelectItem>
                        <SelectItem value="Surabaya">Surabaya</SelectItem>
                        <SelectItem value="Jakarta Selatan">
                          Jakarta Selatan
                        </SelectItem>
                        <SelectItem value="Solo">Solo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kecamatan */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Kecamatan
                    </label>
                    <Select
                      value={kecamatanFilter}
                      onValueChange={setKecamatanFilter}
                    >
                      <SelectTrigger className="h-11 bg-white border-2 hover:border-blue-300 transition-colors">
                        <SelectValue placeholder="Pilih Kecamatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Kecamatan</SelectItem>
                        <SelectItem value="Cicendo">Cicendo</SelectItem>
                        <SelectItem value="Coblong">Coblong</SelectItem>
                        <SelectItem value="Banyumanik">Banyumanik</SelectItem>
                        <SelectItem value="Gubeng">Gubeng</SelectItem>
                        <SelectItem value="Kebayoran Baru">
                          Kebayoran Baru
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Filter Aktif ({activeFiltersCount})
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus Semua
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1.5 flex items-center gap-2">
                      <Search className="h-3 w-3" />"{searchQuery}"
                      <button
                        onClick={() => removeFilter("search")}
                        className="ml-1 hover:text-purple-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {statusFilter !== "semua" && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1.5 flex items-center gap-2">
                      Status:{" "}
                      {statusFilter === "lulus"
                        ? "Lulus"
                        : statusFilter === "tidak_lulus"
                        ? "Tidak Lulus"
                        : "Belum Diperiksa"}
                      <button
                        onClick={() => removeFilter("status")}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {provinsiFilter !== "semua" && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5 flex items-center gap-2">
                      Provinsi: {provinsiFilter}
                      <button
                        onClick={() => removeFilter("provinsi")}
                        className="ml-1 hover:text-green-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {kabupatenFilter !== "semua" && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5 flex items-center gap-2">
                      Kabupaten: {kabupatenFilter}
                      <button
                        onClick={() => removeFilter("kabupaten")}
                        className="ml-1 hover:text-green-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {kecamatanFilter !== "semua" && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5 flex items-center gap-2">
                      Kecamatan: {kecamatanFilter}
                      <button
                        onClick={() => removeFilter("kecamatan")}
                        className="ml-1 hover:text-green-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {jalurFilter !== "semua" && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1.5 flex items-center gap-2">
                      Jalur: {jalurFilter}
                      <button
                        onClick={() => removeFilter("jalur")}
                        className="ml-1 hover:text-orange-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {ptFilter !== "semua" && (
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1.5 flex items-center gap-2">
                      PT: {ptFilter}
                      <button
                        onClick={() => removeFilter("pt")}
                        className="ml-1 hover:text-indigo-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                {activeFiltersCount > 0
                  ? `Menampilkan hasil dengan ${activeFiltersCount} filter aktif`
                  : "Belum ada filter yang diterapkan"}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetAllFilters}
                  disabled={activeFiltersCount === 0}
                  className="border-2"
                >
                  Reset Filter
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                  <Search className="h-4 w-4 mr-2" />
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="text-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
          💡 Komponen filter ini siap diintegrasikan ke halaman utama
        </div>
      </div>
    </div>
  );
};

export default FilterPenelaahan;
