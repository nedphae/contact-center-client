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

export function getDuration(timeDuration: number) {
  if (timeDuration < 60) {
    return `${timeDuration}`;
  }
  const minutes = Math.floor(timeDuration / 60);
  const seconds = timeDuration % 60;
  return `${minutes}:${seconds}`;
}

export function setIntervalAndExecute(handler: () => void, timeout: number) {
  handler();
  return setInterval(handler, timeout);
}
