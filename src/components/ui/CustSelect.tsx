import { Controller, type Control, type FieldError } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Option {
  label: string;
  value: string | number;
}

interface CustSelectProps {
  name: string;
  control: Control<any>;
  label: string;
  options: Option[];
  placeholder?: string;
  error?: FieldError;
  className?: string;
  isRequired?: boolean; // optional, default false
}

export const CustSelect = ({
  name,
  control,
  label,
  options,
  placeholder = "Pilih opsi",
  error,
  className = "",
  isRequired = false, // default value false
}: CustSelectProps) => {
  return (
    <div className={`grid items-center gap-1 ${className}`}>
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            key={field.value}
            value={field.value?.toString() ?? ""}
            onValueChange={(val) => field.onChange(val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  className="font-inter"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
};
