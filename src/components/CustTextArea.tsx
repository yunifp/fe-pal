import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

interface CustTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // optional label text
  error?: boolean;
  errorMessage?: string; // pesan error yang ingin ditampilkan
  id?: string; // supaya bisa untuk label htmlFor
  description?: React.ReactNode;
  isRequired?: boolean; // optional, default false
}

export const CustTextArea = React.forwardRef<
  HTMLTextAreaElement,
  CustTextAreaProps
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
      ...props
    },
    ref
  ) => {
    return (
      <div className="grid items-center gap-1">
        {label && (
          <Label htmlFor={id}>
            {label}
            {isRequired && <span className="text-red-500">*</span>}
          </Label>
        )}
        <Textarea
          id={id}
          ref={ref}
          className={cn(
            "focus-visible:ring focus-visible:ring-primary",
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

CustTextArea.displayName = "CustTextArea";
