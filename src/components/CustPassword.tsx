import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  description?: React.ReactNode;
}

export const CustPassword = React.forwardRef<
  HTMLInputElement,
  CustPasswordProps
>(
  (
    { className, label, error, errorMessage, id, description, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="grid items-start gap-1">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            id={id}
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              "pr-10 focus-visible:ring focus-visible:ring-primary",
              error && "border-red-500",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {description}
        {error && errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  },
);

CustPassword.displayName = "CustPassword";
