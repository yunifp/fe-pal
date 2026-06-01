import * as React from "react";
import { Controller, type Control, type FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string | number;
  label: string;
  isDisabled?: boolean;
}

interface CustSelectProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  label?: string;
  options: Option[];
  placeholder?: string;
  error?: FieldError;
  className?: string;
  isRequired?: boolean;
  isLoading?: boolean;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
  requireSearch?: boolean; // ← Tambahan properti baru
}

// Inner Combobox component
const Combobox = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    options: Option[];
    placeholder: string;
    value: string | number | null | undefined;
    onValueChange: (value: string) => void;
    isLoading?: boolean;
    onInputChange?: (value: string) => void;
    disabled?: boolean;
    requireSearch?: boolean;
  }
>(
  (
    {
      className,
      options,
      placeholder,
      value,
      onValueChange,
      disabled,
      isLoading,
      onInputChange,
      requireSearch = true, // Default true: harus cari dulu baru data muncul
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    // State untuk menyimpan teks yang sedang diketik
    const [inputValue, setInputValue] = React.useState("");
    // State untuk teks yang sudah di-submit
    const [appliedSearch, setAppliedSearch] = React.useState("");
    
    // State untuk melacak apakah user sudah melakukan pencarian
    // Jika requireSearch false, anggap saja sudah dicari dari awal (data langsung tampil)
    const [isSearched, setIsSearched] = React.useState(!requireSearch);

    const selectedOption = options.find(
      (option) => option.value.toString() === value?.toString(),
    );

    // Reset pencarian setiap kali popover ditutup
    React.useEffect(() => {
      if (!open) {
        setInputValue("");
        setAppliedSearch("");
        setIsSearched(!requireSearch); // Reset status pencarian
      }
    }, [open, requireSearch]);

    // Fungsi saat user menekan Enter atau Kaca Pembesar
    const handleSearchSubmit = () => {
      setAppliedSearch(inputValue);
      setIsSearched(true); // Tandai bahwa user sudah mulai mencari
      
      if (onInputChange) {
        onInputChange(inputValue);
      }
    };

    // Filter Options:
    // 1. Jika belum dicari (dan wajib cari), kembalikan array kosong []
    // 2. Jika ada onInputChange (API backend), tampilkan semua options dari backend
    // 3. Jika client-side, filter berdasarkan appliedSearch
    const filteredOptions = !isSearched
      ? []
      : onInputChange
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(appliedSearch.toLowerCase())
        );

    return (
      <Popover
        modal={false}
        open={open}
        onOpenChange={(next) => !disabled && setOpen(next)}>
        <PopoverTrigger asChild ref={ref}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between overflow-hidden",
              disabled && "cursor-not-allowed opacity-50 bg-muted",
              className,
            )}
            {...props}>
            <span className="truncate text-left">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="font-inter w-full p-0 z-[9999]">
          <Command shouldFilter={false}>
            <div className="relative flex items-center border-b">
              <CommandInput
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                className="h-10 pr-10 w-full"
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Custom Empty / Helper State */}
            {!isSearched && !isLoading ? (
              <div className="py-6 px-4 text-center text-sm text-muted-foreground">
                Ketik kata kunci lalu tekan Enter untuk memuat data.
              </div>
            ) : isSearched && filteredOptions.length === 0 && !isLoading ? (
              <div className="py-6 px-4 text-center text-sm text-muted-foreground">
                Data tidak ditemukan.
              </div>
            ) : null}

            <CommandGroup>
              <CommandList className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Memuat data...
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      disabled={option.isDisabled}
                      onSelect={() => {
                        if (option.isDisabled) return;
                        onValueChange(option.value.toString());
                        setOpen(false);
                      }}
                      className={cn(
                        option.isDisabled && "opacity-40 cursor-not-allowed",
                      )}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.toString() === option.value.toString()
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))
                )}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";

// Main component
export const CustSearchableSelect = ({
  name,
  control,
  label,
  options,
  placeholder = "Pilih opsi",
  error,
  className = "",
  isRequired = false,
  isLoading = false,
  onInputChange,
  disabled = false,
  requireSearch = true, // Default diset true agar sesuai request Anda (Ga berat di awal)
}: CustSelectProps) => {
  return (
    <div className={`grid items-center gap-1 ${className}`}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Combobox
            className={cn(
               "focus-visible:ring focus-visible:ring-primary",
              error && "border-red-500",
            )}
            options={options}
            placeholder={placeholder}
            value={field.value}
            onValueChange={field.onChange}
            isLoading={isLoading}
            onInputChange={onInputChange}
            disabled={disabled}
            requireSearch={requireSearch}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
};