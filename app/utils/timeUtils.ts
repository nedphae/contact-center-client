export function javaInstant2Num(instant: number): Date {
  const intNum = Math.trunc(instant);
  const fract = instant - intNum;
  // 这里乘 1000 把 nanoseconds to milli
  const milli = intNum * 1000 + fract * 1000;
  return new Date(milli);
}

export default function javaInstant2DateStr(
  instant: number | string | Date
): string | undefined {
  let date;
  if (typeof instant === 'string') {
    return instant;
  }
  if (instant instanceof Date) {
    date = instant;
  }
  if (Number.isFinite(instant)) {
    date = javaInstant2Num(instant as number);
  }
  return date?.toLocaleString();
}
