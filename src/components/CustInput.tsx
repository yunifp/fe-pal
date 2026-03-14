import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CustInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  description?: React.ReactNode;
  isRequired?: boolean;
  showCount?: boolean; // ← tambah ini
}

export const CustInput = React.forwardRef<HTMLInputElement, CustInputProps>(
  (
    {
      className,
      label,
      error,
      errorMessage,
      id,
      description,
      isRequired = false,
      showCount = false,
      onChange, // ← destructure onChange
      ...props
    },
    ref,
  ) => {
    // ← state internal untuk track panjang karakter
    const [length, setLength] = React.useState(
      () => String(props.defaultValue ?? props.value ?? "").length,
    );
    const maxLen = props.maxLength;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLength(e.target.value.length);
      onChange?.(e); // tetap teruskan ke react-hook-form
    };

    return (
      <div className="space-y-1">
        {label && (
          <div className="flex items-center justify-between">
            <Label htmlFor={id}>
              {label}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {showCount && maxLen && (
              <span
                className={`text-xs tabular-nums font-medium transition-colors ${
                  length === maxLen
                    ? "text-emerald-600"
                    : length > maxLen * 0.8
                      ? "text-amber-500"
                      : "text-slate-400"
                }`}>
                {length}/{maxLen}
              </span>
            )}
          </div>
        )}
        <Input
          id={id}
          ref={ref}
          onChange={handleChange} // ← pakai handleChange
          className={cn(
            "bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            error && "border-red-500",
            className,
          )}
          {...props}
        />
        {description}
        {error && errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  },
);

CustInput.displayName = "CustInput";
