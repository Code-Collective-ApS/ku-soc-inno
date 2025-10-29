export function prettyByteSize(bytes: number, decimals = 1) {
  if (typeof bytes !== "number" || isNaN(bytes)) {
    return "-";
  }
  let lvl = 0;
  const getDivisor = (_lvl: number) => Math.pow(1024, _lvl);
  const lvlStrings = ["bytes", "kb", "mb", "gb"];
  if (bytes > getDivisor(3)) {
    lvl = 3;
  } else if (bytes > getDivisor(2)) {
    lvl = 2;
  } else if (bytes > getDivisor(1)) {
    lvl = 1;
  }
  const lvlStr = lvlStrings[lvl];
  const tenPowDecimals = Math.pow(10, decimals - 1);
  const num = bytes / getDivisor(lvl);
  const prettyNum = Math.round(tenPowDecimals * num) / tenPowDecimals;
  return `${prettyNum.toFixed(decimals)} ${lvlStr}`;
}
