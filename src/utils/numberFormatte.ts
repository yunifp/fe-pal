export const normalizeDecimal = (value: any): number => {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") return value;

  // handle "95000000,000000"
  return Number(value.toString().replace(",", "."));
};
