export function numeric(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

export function integerValue(value: bigint): number | string {
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : value.toString();
}
