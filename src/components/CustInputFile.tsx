import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CustInputFileProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  description?: React.ReactNode;
}

export const CustInputFile = React.forwardRef<
  HTMLInputElement,
  CustInputFileProps
>(
  (
    { className, label, error, errorMessage, id, description, ...props },
    ref
  ) => {
    return (
      <div className="grid items-center gap-1">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Input
          id={id}
          ref={ref}
          type="file"
          className={cn(
            "focus-visible:ring focus-visible:ring-primary cursor-pointer",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {description}
        {error && errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }
);

CustInputFile.displayName = "CustInputFile";
