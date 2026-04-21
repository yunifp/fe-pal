import { useEffect, useRef } from "react";
import type { UseFormSetValue, FieldValues, Path } from "react-hook-form";

/**
 * Auto-clear dependent fields ketika parent berubah.
 * Guard pakai ref supaya tidak clear saat inisialisasi reset().
 *
 * @param parentValue  - nilai watch() dari field parent
 * @param childFields  - array field yang harus di-clear ketika parent berubah
 * @param setValue     - dari useForm
 */
export function useCascadeSelect<T extends FieldValues>(
  parentValue: string | undefined,
  childFields: Path<T>[],
  setValue: UseFormSetValue<T>,
) {
  const prevRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Skip saat mount pertama (inisialisasi reset)
    if (prevRef.current === undefined) {
      prevRef.current = parentValue;
      return;
    }

    // Hanya clear jika nilai benar-benar berubah
    if (prevRef.current !== parentValue) {
      childFields.forEach((field) => setValue(field, "" as any));
    }

    prevRef.current = parentValue;
  }, [parentValue]); // eslint-disable-line react-hooks/exhaustive-deps
}