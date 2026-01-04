// import crypto from "node:crypto";
import { verifyEmailTemplate } from "./mails/templates/verify-email";
import { generateJwt } from "./signing";

const msPrMinute = 1000 * 60;

export function generateVerificationLink(
  userId: number,
  email: string,
  validInMinutes = 30,
) {
  // TODO: make email a hash instead (if sending payload at least)
  const config = useRuntimeConfig();
  const expireDate = new Date(Date.now() + msPrMinute * validInMinutes); // TODO: make expiration
  const jwt = generateJwt(
    config.verificationSecret,
    { userId, email },
    expireDate,
  );

  const link = `${config.publicHost}/account-automatic-verification?jwt=${jwt}`;
  console.log(`verification link valid in ${validInMinutes} min:`, link);
  return link;
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
      "Velkommen til Soc-Inno! Færdiggør opsætning af din nye konto",
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
