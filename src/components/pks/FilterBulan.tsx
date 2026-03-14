import { type Control } from "react-hook-form";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";

interface FilterBulanProps {
  control: Control<any>;
}

const bulanIndonesia = [
  { value: "Januari", label: "Januari" },
  { value: "Februari", label: "Februari" },
  { value: "Maret", label: "Maret" },
  { value: "April", label: "April" },
  { value: "Mei", label: "Mei" },
  { value: "Juni", label: "Juni" },
  { value: "Juli", label: "Juli" },
  { value: "Agustus", label: "Agustus" },
  { value: "September", label: "September" },
  { value: "Oktober", label: "Oktober" },
  { value: "November", label: "November" },
  { value: "Desember", label: "Desember" },
];

const FilterBulan = ({ control }: FilterBulanProps) => {
  return (
    <div className="w-48">
      <CustSearchableSelect
        name="bulan"
        control={control}
        placeholder="Filter Bulan"
        options={bulanIndonesia}
      />
    </div>
  );
};

export default FilterBulan;
