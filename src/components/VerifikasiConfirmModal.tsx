import { useState, type FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustInput } from "./CustInput";

interface VerifikasiConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VerifikasiConfirmModal: FC<VerifikasiConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState("");

  const isValid = inputValue === "VERIFIKASI";

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setInputValue("");
    }
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="font-inter">
        <DialogHeader>
          <DialogTitle>Konfirmasi Verifikasi</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Ketikkan <span className="font-bold">VERIFIKASI</span> untuk
          mengonfirmasi data ini akan diverifikasi.
        </DialogDescription>
        <CustInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Ketikkan "VERIFIKASI"'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirm();
            }
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 focus:text-white hover:text-white"
          >
            Verifikasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifikasiConfirmModal;
