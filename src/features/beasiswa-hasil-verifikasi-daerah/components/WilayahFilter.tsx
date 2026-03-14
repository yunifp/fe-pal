import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { wilayahService } from "@/services/wilayahService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { IWilayah } from "@/types/master";

interface WilayahFilterProps {
  selectedProvinsi: string;
  selectedKabKot: string;
  onProvinsiChange: (value: string) => void;
  onKabKotChange: (value: string) => void;
}

const WilayahFilter = ({
  selectedProvinsi,
  selectedKabKot,
  onProvinsiChange,
  onKabKotChange,
}: WilayahFilterProps) => {
  // Query provinsi
  const { data: responseProvinsi, isLoading: isLoadingProvinsi } = useQuery({
    queryKey: ["provinsi"],
    queryFn: () => wilayahService.getProvinsi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const provinsiList: IWilayah[] = responseProvinsi?.data ?? [];

  // Query kabupaten/kota
  const { data: responseKabKot, isLoading: isLoadingKabKot } = useQuery({
    queryKey: ["kabkot", selectedProvinsi],
    queryFn: () => wilayahService.getKabKotByProvinsi(selectedProvinsi),
    enabled: !!selectedProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kabKotList: IWilayah[] = responseKabKot?.data ?? [];

  const handleProvinsiChange = (value: string) => {
    onProvinsiChange(value);
    onKabKotChange(""); // Reset kabkot saat provinsi berubah
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Select Provinsi */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Provinsi</label>
        <Select
          value={selectedProvinsi}
          onValueChange={handleProvinsiChange}
          disabled={isLoadingProvinsi}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent>
            {provinsiList.map((prov) => (
              <SelectItem
                key={prov.wilayah_id}
                value={prov.kode_pro?.toString() ?? ""}>
                {prov.nama_wilayah}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select Kabupaten/Kota */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Kabupaten/Kota</label>
        <Select
          value={selectedKabKot}
          onValueChange={onKabKotChange}
          disabled={!selectedProvinsi || isLoadingKabKot}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kabupaten/Kota" />
          </SelectTrigger>
          <SelectContent>
            {kabKotList.map((kabkot) => (
              <SelectItem
                key={kabkot.wilayah_id}
                value={kabkot.kode_kab?.toString() ?? ""}>
                {kabkot.nama_wilayah}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default WilayahFilter;
