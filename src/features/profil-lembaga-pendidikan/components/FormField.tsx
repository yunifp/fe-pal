import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type FormFieldProps<T> = {
  icon?: React.ElementType;
  label: string;
  name: keyof T;
  value?: string | null | number;
  onChange?: (name: keyof T, val: string) => void;
  onFileChange?: (name: keyof T, file: File) => void;
  type?: string;
  placeholder?: string;
};

const FormField = <T,>({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  onFileChange,
  type = "text",
  placeholder,
}: FormFieldProps<T>) => {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={String(name)}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
      >
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Label>

      {type === "file" ? (
        <>
          <Input
            id={String(name)}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFileChange) {
                onFileChange(name, file);
                setPreview(URL.createObjectURL(file));
              }
            }}
            className="h-9 border-slate-200 bg-white text-sm shadow-none"
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 h-20 rounded-md border object-contain"
            />
          )}
        </>
      ) : (
        <Input
          id={String(name)}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(name, e.target.value)}
          placeholder={placeholder ?? label}
          className="h-9 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-slate-400"
        />
      )}
    </div>
  );
};

export default FormField;
