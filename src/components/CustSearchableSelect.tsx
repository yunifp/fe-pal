import * as React from "react";
import { Controller, type Control, type FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string | number;
  label: string;
}

interface CustSelectProps {
  name: string;
  control: Control<any>;
  label?: string;
  options: Option[];
  placeholder?: string;
  error?: FieldError;
  className?: string;
  isRequired?: boolean; // optional, default false
  isLoading?: boolean;
  onInputChange?: (value: string) => void;
}

// Inner Combobox component (diekstrak untuk handle state open)
const Combobox = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    options: Option[];
    placeholder: string;
    value: string | number | null | undefined;
    onValueChange: (value: string) => void;
    isLoading?: boolean;
    onInputChange?: (value: string) => void;
  }
>(
  (
    { className, options, placeholder, value, onValueChange, ...props },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    const selectedOption = options.find(
      (option) => option.value.toString() === value?.toString(),
    );

    return (
      <Popover modal={false} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild ref={ref}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            {...props}>
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="font-inter w-full p-0 z-[9999]">
          <Command>
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className="h-9"
            />
            <CommandEmpty>No options found.</CommandEmpty>

            <CommandGroup>
              <CommandList className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value.toString());
                      setOpen(false);
                    }}>
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
                ))}
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
  isRequired = false, // default value false
  isLoading = false,
  onInputChange,
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
              className,
            )}
            options={options}
            placeholder={placeholder}
            value={field.value}
            onValueChange={field.onChange}
            isLoading={isLoading}
            onInputChange={onInputChange}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
};
