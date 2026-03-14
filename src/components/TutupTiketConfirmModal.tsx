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

interface TutupTiketConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TutupTiketConfirmModal: FC<TutupTiketConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState("");

  const isValid = inputValue === "TUTUP TIKET";

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
          <DialogTitle>Konfirmasi Penutupan Tiket</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Ketikkan <span className="font-bold">TUTUP TIKET</span> untuk
          mengonfirmasi penutupan tiket ini. <br />
          <br />
          Setelah tiket ditutup, Anda tidak dapat lagi mengirim atau menerima
          pesan pada tiket ini.
        </DialogDescription>
        <CustInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Ketikkan "TUTUP TIKET"'
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
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Tutup Tiket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TutupTiketConfirmModal;
