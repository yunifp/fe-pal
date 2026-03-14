interface PilihanProgramStudi {
  perguruan_tinggi: string;
  program_studi: string;
}

interface OptionType {
  value: string;
  label: string;
}

/**
 * Validasi existing pilihan program studi terhadap options yang tersedia
 * Jika PT tidak valid/kosong → reset ke ""
 * Jika PT valid tapi Prodi tidak valid → keep PT, reset Prodi
 */
export const validateExistingPilihan = (
  existingData: PilihanProgramStudi[],
  availablePTOptions: OptionType[],
): PilihanProgramStudi[] => {
  if (!existingData || existingData.length === 0) {
    return [];
  }

  return existingData.map((item) => {
    // Cek apakah perguruan tinggi kosong
    if (!item.perguruan_tinggi || item.perguruan_tinggi.trim() === "") {
      return {
        perguruan_tinggi: "",
        program_studi: "",
      };
    }

    // Cek apakah PT valid (ada di available options)
    const isPTValid = availablePTOptions.some(
      (opt) => opt.value === item.perguruan_tinggi,
    );

    // Jika PT tidak valid, reset semua
    if (!isPTValid) {
      return {
        perguruan_tinggi: "",
        program_studi: "",
      };
    }

    // PT valid, keep PT, prodi akan divalidasi di component child
    return {
      perguruan_tinggi: item.perguruan_tinggi,
      program_studi: item.program_studi || "",
    };
  });
};
