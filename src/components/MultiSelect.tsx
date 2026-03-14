import { useEffect, useState } from "react";
import Select from "react-select";
import { Label } from "./ui/label";

interface OptionType {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  options: OptionType[];
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
  placeholder?: string;
}

const MultiSelect = ({
  label,
  error,
  errorMessage,
  id,
  options,
  value,
  placeholder = "",
  onChange,
}: MultiSelectProps) => {
  const [primaryColor, setPrimaryColor] = useState("#6366f1");

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVar = rootStyles.getPropertyValue("--primary").trim();
    if (cssVar) setPrimaryColor(cssVar);
  }, []);

  const getCustomStyles = (error: boolean) => ({
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "white",
      borderColor: error
        ? "#ef4444"
        : state.isFocused
        ? primaryColor
        : "#e5e7eb",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      padding: "2px",
      minHeight: "40px",
      boxShadow:
        state.isFocused && !error ? `0 0 0 1px ${primaryColor}` : "none",
      "&:hover": {
        borderColor: error ? "#ef4444" : primaryColor,
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: `${primaryColor}1A`,
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: primaryColor,
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: primaryColor,
      ":hover": {
        backgroundColor: primaryColor,
        color: "white",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    input: (base: any) => ({
      ...base,
      color: "#111827",
    }),
  });

  return (
    <div className="grid items-center gap-1">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select
        id={id}
        isMulti
        options={options}
        value={value}
        onChange={(newValue) => onChange([...newValue])}
        styles={getCustomStyles(!!error)}
        className="text-sm"
        classNamePrefix="react-select"
        placeholder={placeholder}
      />
      {error && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default MultiSelect;
