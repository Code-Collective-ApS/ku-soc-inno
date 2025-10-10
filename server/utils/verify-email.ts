import crypto from "node:crypto";
import { verifyEmailTemplate } from "./mails/verify-email";

const msPrMinute = 1000 * 60;

export function generateVerificationLink(
  userId: number,
  email: string,
  validInMinutes = 30,
) {
  // TODO: make email a hash instead (if sending payload at least)
  const config = useRuntimeConfig();
  const sig = generateSignature(config.verificationSecret, userId, email);
  const _expiration = Date.now() + msPrMinute * validInMinutes; // TODO: make expiration

  const link = `${config.publicHost}/account-verification?sig=${sig}`;
  console.log(`verification link valid in ${validInMinutes} min:`, link);
  return link;
}

export function generateSignature(secret: string, ...rawPayload: AnyType[]) {
  const payload = rawPayload.map((v) => v + "").join("|");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const signature = hmac.digest("hex");
  return signature;
}

export async function sendVerifyEmailEmail(
  userId: number,
  name: string,
  email: string,
) {
  try {
    if (!email) throw "Email is missing";
    if (!name) throw "Name is missing";
    if (!userId) throw "User id is missing";

    const link = generateVerificationLink(userId, email);
    await sendMail(
      email,
      "Welcome to Soc-inno! Finish setting up your account",
      verifyEmailTemplate(name, link),
      true,
    );
  } catch (e) {
    console.error(e);
    let msg = "We were unable to send emails. Please come back later!";
    if (typeof e === "string") {
      msg = e;
    }
    throw createError({
      statusCode: 500,
      statusText: msg,
    });
  }
}
