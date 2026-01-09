import { toBase64Url } from "#shared/utils/base64_url";
import { verifyEmailTemplate } from "./mails/templates/verify-email";
import { generateJwt } from "./signing";

const msPrMinute = 1000 * 60;

export const VerifyEmailValidityMinutes = 5;
export const VerifyEmailValidityMs = VerifyEmailValidityMinutes * 60 * 1000;

export function generateVerificationLink(
  baseUrl: string,
  secret: string,
  userId: number,
  email: string,
  validInMinutes: number,
) {
  // TODO: make email a hash instead (if sending payload at least)
  const expireDate = new Date(Date.now() + msPrMinute * validInMinutes); // TODO: make expiration
  const jwt = generateJwt(
    secret,
    { userId, email, type: "verify-email" },
    expireDate,
  );

  const link = `${baseUrl}/account-automatic-verification?email=${toBase64Url(email)}&jwt=${jwt}`;
  console.log(`verification link valid in ${validInMinutes} min:`, link);
  return link;
}

export async function sendVerifyEmailEmail(
  baseUrl: string,
  secret: string,
  userId: number,
  name: string,
  email: string,
) {
  if (!email) throw "Email is missing";
  if (!name) throw "Name is missing";
  if (!userId) throw "User id is missing";

  const link = generateVerificationLink(
    baseUrl,
    secret,
    userId,
    email,
    VerifyEmailValidityMinutes,
  );
  await sendMail(
    email,
    "Velkommen til Soc-Inno! Færdiggør opsætning af din nye konto",
    verifyEmailTemplate(name, link),
    true,
  );
}
