import crypto from "node:crypto";

/*
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64#url_and_filename_safe_base64
 * - "This version, defined in RFC 4648, section 5, omits the padding and replaces + and / with - and _."
 */
function toBase64Url(inp: string): string {
  let res = btoa(inp);
  res = res.replaceAll("+", "-");
  res = res.replaceAll("/", "_");
  res = res.replaceAll("=", "");
  return res;
}

function fromBase64Url(inp: string): string {
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

function signText(inp: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(inp);
  const signature = hmac.digest("base64url");
  return signature;
}

export function generateJwt(
  secret: string,
  rawPayload: AnyObject,
  expiration: Date,
) {
  if (!rawPayload) throw new Error("Payload cannot be empty");

  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const payload = {
    exp: Math.round(expiration.getTime() / 1000),
    iss: "soc-inno",
    ...rawPayload,
  };

  const bHeader = toBase64Url(JSON.stringify(header));
  const bPayload = toBase64Url(JSON.stringify(payload));
  const bSignature = signText(bHeader + "." + bPayload, secret);
  return bHeader + "." + bPayload + "." + bSignature;
}

/**
 * NOTE: returns the error, is any
 */
export function parseJwt(
  secret: string,
  inputToken: string,
): { error: string | undefined; payload?: Record<string, AnyType> } {
  const err = (msg: string) => ({ error: msg });
  if (inputToken.length > 1000) return err("Invalid input token");
  const parts = inputToken.split(".");
  if (parts.length !== 3) return err("Invalid input token");
  if (parts.some((p) => !p)) return err("Invalid input token");

  try {
    const header = fromBase64Url(parts[0]);
    const payload = fromBase64Url(parts[1]);
    const signature = parts[2];

    const headerJson = JSON.parse(header) as Record<string, string>;
    if (headerJson.alg !== "HS256") return err("Unsupported algorithm");
    if (headerJson.typ !== "JWT") return err("Unsupported type");
    const payloadJson = JSON.parse(payload) as Record<string, AnyType>;
    if (payloadJson?.iss !== "soc-inno") return err("Invalid token issuer");
    if (!payloadJson?.exp) return err("Invalid exp value");
    if (Date.now() < (payloadJson.exp as number))
      return err("Dette token er udløbet");
    const testSignature = signText(parts[0] + "." + parts[1], secret);
    if (testSignature !== signature) {
      // TODO: report error
      console.error("testSignature is not valid to given signature");
      return err("Invalid input token");
    }
    return { error: undefined, payload: payloadJson };
  } catch (e) {
    // TODO: report error
    console.error(e);
    return err("Der skete en uventet fejl. Fejlen er rapporteret automatisk.");
  }
}
