import { type Control } from "react-hook-form";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { jenjangKuliah } from "@/data/jenjangKuliah";

interface FilterJenjangProps {
  control: Control<any>;
}

const FilterJenjang = ({ control }: FilterJenjangProps) => {
  const options = jenjangKuliah.map((item) => ({
    value: item.nama,
    label: item.nama,
  }));

  return (
    <div className="w-40">
      <CustSearchableSelect
        name="jenjang"
        control={control}
        placeholder="Filter Jenjang"
        options={options}
      />
    </div>
  );
};

export default FilterJenjang;
