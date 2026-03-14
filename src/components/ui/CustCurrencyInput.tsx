import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CustCurrencyInputProps {
  label: string;
  id: string;
  placeholder?: string;
  isRequired?: boolean;
  error?: boolean;
  errorMessage?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
}

const CustCurrencyInput = forwardRef<HTMLInputElement, CustCurrencyInputProps>(
  (
    {
      label,
      id,
      placeholder = "Masukkan penghasilan",
      isRequired = false,
      error = false,
      errorMessage,
      value = "",
      onChange,
      onBlur,
      name,
    },
    ref,
  ) => {
    // Format number to rupiah currency
    const formatRupiah = (value: string): string => {
      // Remove all non-digit characters
      const numbers = value.replace(/\D/g, "");

      if (!numbers) return "";

      // Format with thousand separators
      const formatted = new Intl.NumberFormat("id-ID").format(
        parseInt(numbers),
      );

      return `Rp ${formatted}`;
    };

    // Remove formatting to get raw number
    const unformatRupiah = (value: string): string => {
      return value.replace(/\D/g, "");
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const rawValue = unformatRupiah(inputValue);

      // Create synthetic event with raw value for react-hook-form
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: rawValue,
          name: name || id,
        },
      };

      if (onChange) {
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    // Get display value (formatted)
    const displayValue = value ? formatRupiah(value) : "";

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={id}
          name={name || id}
          ref={ref}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          className={error ? "border-red-500 focus:ring-red-500" : ""}
        />
        {error && errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  },
);

CustCurrencyInput.displayName = "CustCurrencyInput";

export { CustCurrencyInput };
