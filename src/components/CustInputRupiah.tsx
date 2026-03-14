import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CustInputRupiahProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  description?: React.ReactNode;
  isRequired?: boolean;
  value?: number;
  onValueChange?: (value: number) => void;
}

const formatRupiah = (value: string | number) => {
  if (value === null || value === undefined || value === "") return "";
  const numberString = value.toString().replace(/\D/g, "");
  if (numberString === "") return "";
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const CustInputRupiah = React.forwardRef<
  HTMLInputElement,
  CustInputRupiahProps
>(
  (
    {
      className,
      label,
      error,
      errorMessage,
      id,
      description,
      isRequired = false,
      value,
      onValueChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");

    // ✅ PERBAIKAN: Selalu update displayValue ketika value prop berubah
    React.useEffect(() => {
      const formatted = formatRupiah(value ?? 0);
      setDisplayValue(formatted);
    }, [value, id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");

      if (!/^\d*$/.test(rawValue)) return;

      const formatted = formatRupiah(rawValue);
      setDisplayValue(formatted);

      const numericValue = rawValue ? Number(rawValue) : 0;
      onValueChange?.(numericValue);
    };

    return (
      <div className="space-y-1">
        {label && (
          <Label htmlFor={id}>
            {label}
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
        )}

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            Rp
          </span>

          <Input
            id={id}
            ref={ref}
            value={displayValue}
            onChange={handleChange}
            inputMode="numeric"
            disabled={disabled}
            className={cn(
              "pl-9 bg-white",
              error && "border-red-500",
              disabled && "cursor-not-allowed opacity-60 bg-gray-50",
              className,
            )}
            {...props}
          />
        </div>

        {description}
        {error && errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  },
);

CustInputRupiah.displayName = "CustInputRupiah";
