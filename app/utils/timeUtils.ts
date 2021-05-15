export default function javaInstant2Date(
  instant: number | string | Date
): string {
  let date;
  if (instant instanceof Date) {
    date = instant;
  }
  const array = instant.toString().split('.');
  date = new Date(Number(array[0]) * 1000 + Number(array[1]) / 1000);
  return date.toLocaleString();
}
