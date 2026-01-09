/*
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64#url_and_filename_safe_base64
 * - "This version, defined in RFC 4648, section 5, omits the padding and replaces + and / with - and _."
 */
export function toBase64Url(inp: string): string {
  let res = btoa(inp);
  res = res.replaceAll("+", "-");
  res = res.replaceAll("/", "_");
  res = res.replaceAll("=", "");
  return res;
}

export function fromBase64Url(inp: string): string {
  inp = inp.replaceAll("-", "+");
  inp = inp.replaceAll("_", "/");

  const padMod = inp.length % 4;
  const padLen = padMod ? 4 - padMod : 0;
  if (padLen > 0) {
    inp += "=".repeat(padLen);
  }

  const res = atob(inp);
  return res;
}
