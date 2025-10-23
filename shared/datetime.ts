const twoDigits = (n: number): string => (n < 10 && n > -1 ? "0" + n : "" + n);

function parseDate(d: Date | string | number): Date {
  if (typeof d === "string" || typeof d === "number") {
    return new Date(d);
  } else {
    return d;
  }
}

export function prettyDate(
  d: Date | string | null | undefined,
  includeTime = true,
): string {
  if (!d) {
    return "";
  }
  d = parseDate(d);
  const year = twoDigits(d.getFullYear());
  const month = twoDigits(d.getMonth() + 1);
  const date = twoDigits(d.getDate());

  let result = `${year}-${month}-${date}`;

  if (includeTime) {
    const hour = twoDigits(d.getHours());
    const minute = twoDigits(d.getMinutes());
    const time = `${hour}:${minute}`;
    result += " " + time;
  }

  return result;
}
