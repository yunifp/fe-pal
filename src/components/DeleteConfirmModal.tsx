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

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState("");

  const isValid = inputValue === "HAPUS";

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
          <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Ketikkan <span className="font-bold">HAPUS</span> untuk mengonfirmasi
          penghapusan data ini.
        </DialogDescription>
        <CustInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Ketikkan "HAPUS"'
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
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
