import { type Control } from "react-hook-form";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";

interface FilterLpProps {
  control: Control<any>;
  options: { value: string; label: string }[];
}

const FilterLembagaPendidikan = ({ control, options }: FilterLpProps) => {
  return (
    <div className="w-64">
      <CustSearchableSelect
        name="lpId"
        control={control}
        placeholder="Filter Lembaga Pendidikan"
        options={options}
      />
    </div>
  );
};

export default FilterLembagaPendidikan;
