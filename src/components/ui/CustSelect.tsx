/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, type Control, type FieldError } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  disabled?: boolean;
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
  disabled = false,
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
            disabled={disabled}>
            <SelectTrigger
              className={cn(
                "w-full overflow-hidden",
                disabled && "cursor-not-allowed opacity-50 bg-muted", // ← styling disabled
              )}>
              <SelectValue placeholder={placeholder} className="truncate" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem
                  key={`${option.value}-${index}`}
                  value={option.value.toString()}
                  className="font-inter">
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
