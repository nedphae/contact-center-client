export function javaInstant2Num(instant: number): Date {
  const array = instant.toString().split('.');
  return new Date(Number(array[0]) * 1000 + Number(array[1]) / 1000);
}

export default function javaInstant2DateStr(
  instant: number | string | Date
): string | undefined {
  let date;
  if (instant instanceof Date) {
    date = instant;
  }
  if (Number.isFinite(instant)) {
    date = javaInstant2Num(instant as number);
  }
  return date?.toLocaleString();
}
