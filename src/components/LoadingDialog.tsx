import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LoadingDialogProps {
  open: boolean;
  title?: string;
  subtitle?: string;
}

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const LoadingDialog: React.FC<LoadingDialogProps> = ({
  open,
  title = "Memuat data",
  subtitle = "Mohon tunggu sebentar",
}) => {
  return (
    <Dialog open={open}>
      <DialogContent className="font-inter" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingDialog;
