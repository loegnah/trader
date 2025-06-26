export function roundDownToUnit(value: number, unit: number) {
  if (unit <= 0) {
    throw new Error("unit must be greater than 0");
  }
  const unitLength = unit.toString().split(".")[1]?.length || 0;
  const k = Math.floor(value / unit) * unit;
  return Number(k.toFixed(unitLength));
}
