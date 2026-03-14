import { type Control } from "react-hook-form";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { tahun } from "@/data/tahun";

interface FilterTahunProps {
  control: Control<any>;
}

const FilterTahun = ({ control }: FilterTahunProps) => {
  const options = tahun.map((item) => ({
    value: item,
    label: item,
  }));

  return (
    <div className="w-40">
      <CustSearchableSelect
        name="tahun"
        control={control}
        placeholder="Filter Tahun"
        options={options}
      />
    </div>
  );
};

export default FilterTahun;
